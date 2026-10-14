-- BSH Solutions — Detailed invoices: line items, issue date, percentage tax.
-- Run this once in the Supabase Dashboard → SQL Editor, after
-- 0009_currency.sql. Safe to re-run.
--
-- WHY: invoices previously stored a single opaque `amount`, so an invoice
-- could never say WHAT was being billed, and the API had to compute every
-- figure itself (subtotal, tax, total) and keep them consistent by hand.
-- After this migration the database owns that arithmetic:
--
--   invoice_items.line_total  = quantity x unit_price        (generated column)
--   invoices.amount           = sum(line_total)              (trigger)
--   invoices.tax              = amount x tax_rate / 100      (trigger, when tax_rate > 0)
--   invoices.total            = amount + tax - discount      (generated column, pre-existing)
--
-- So the application only ever writes the facts (the lines, the tax rate,
-- the discount) and reads the totals back — there is no duplicated money
-- math in TypeScript any more.

-- ─────────────────────────── invoice_items ───────────────────────────
create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  -- Display order, 0-based. Kept explicit rather than relying on created_at
  -- so lines can be reordered without rewriting timestamps.
  position int not null default 0,
  description text not null,
  quantity numeric(12, 2) not null default 1 check (quantity > 0),
  unit_price numeric(12, 2) not null default 0 check (unit_price >= 0),
  -- round(numeric, int) is immutable, so it is allowed in a stored generated column.
  line_total numeric(14, 2) generated always as (round(quantity * unit_price, 2)) stored
);
create index if not exists invoice_items_invoice_id_idx on public.invoice_items (invoice_id, position);
alter table public.invoice_items enable row level security;
-- No policies on purpose: like every other table here, access is
-- service_role only (the admin API), default-deny for anon/authenticated.

-- ─────────────────────────── invoices: new columns ───────────────────────────

-- Issue date — the date the invoice is dated FOR, which is not necessarily
-- the row's created_at (e.g. entering last month's invoice today). Finance
-- reporting buckets accrual revenue by this date.
alter table public.invoices add column if not exists issue_date date;
-- Backfill historical rows from created_at rather than letting them all
-- default to today, which would silently misdate every existing invoice.
update public.invoices set issue_date = created_at::date where issue_date is null;
alter table public.invoices alter column issue_date set default current_date;
alter table public.invoices alter column issue_date set not null;

-- Tax as a percentage. The absolute `tax` column stays (the generated
-- `total` depends on it) and is derived from this rate by trigger.
-- tax_rate = 0 means "tax entered as a flat amount" — the legacy behaviour,
-- still supported so existing invoices and their edit form keep working.
alter table public.invoices add column if not exists tax_rate numeric(5, 2) not null default 0
  check (tax_rate >= 0 and tax_rate <= 100);

create index if not exists invoices_issue_date_idx on public.invoices (issue_date desc);

-- ─────────────────────────── derived money: triggers ───────────────────────────

-- Keeps invoices.tax in step with tax_rate. Only acts when a rate is set, so
-- invoices that use a flat tax amount (tax_rate = 0) are left alone.
create or replace function public.sync_invoice_tax()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.tax_rate > 0 then
    if tg_op = 'INSERT'
       or new.tax_rate is distinct from old.tax_rate
       or new.amount is distinct from old.amount then
      new.tax := round(new.amount * new.tax_rate / 100, 2);
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists invoices_sync_tax on public.invoices;
create trigger invoices_sync_tax
  before insert or update on public.invoices
  for each row execute function public.sync_invoice_tax();

-- Recomputes invoices.amount from its line items. Fires per row so a single
-- bulk replace of an invoice's lines still lands on one consistent total.
-- Invoices with no line items are never touched by this (the trigger only
-- runs when a line changes), so legacy flat-amount invoices are unaffected.
create or replace function public.recalc_invoice_from_items()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invoice_id uuid := coalesce(new.invoice_id, old.invoice_id);
  v_subtotal numeric(14, 2);
begin
  select coalesce(sum(line_total), 0) into v_subtotal
    from public.invoice_items where invoice_id = v_invoice_id;

  -- invoices_sync_tax (BEFORE UPDATE) picks the new tax up from here.
  update public.invoices set amount = v_subtotal where id = v_invoice_id;

  return null;
end;
$$;

drop trigger if exists invoice_items_recalc on public.invoice_items;
create trigger invoice_items_recalc
  after insert or update or delete on public.invoice_items
  for each row execute function public.recalc_invoice_from_items();

-- ─────────────────────────── invoice_balances: more columns ───────────────────────────
-- New columns are appended at the END of the select list: Postgres's CREATE
-- OR REPLACE VIEW errors (42P16) if the position/type of an existing output
-- column changes. Same constraint as 0004_invoice_currency.sql.
--
-- invoice_number/project_id/issue_date land here so the invoices list page
-- can render from this single view instead of issuing a second query to
-- invoices just to resolve numbers.
create or replace view public.invoice_balances as
select
  i.id as invoice_id,
  i.client_id,
  i.status,
  i.due_date,
  i.total,
  coalesce(p.paid, 0) as paid,
  i.total - coalesce(p.paid, 0) as balance,
  (i.status in ('sent', 'partially_paid') and i.due_date < current_date) as is_overdue,
  i.currency,
  i.invoice_number,
  i.project_id,
  i.issue_date,
  i.amount,
  i.tax,
  i.tax_rate,
  i.discount,
  i.notes,
  i.created_at,
  coalesce(it.item_count, 0) as item_count,
  p.last_payment_on
from public.invoices i
left join (
  select invoice_id, sum(amount) as paid, max(paid_on) as last_payment_on
    from public.payments group by invoice_id
) p on p.invoice_id = i.id
left join (
  select invoice_id, count(*) as item_count
    from public.invoice_items group by invoice_id
) it on it.invoice_id = i.id;

-- ─────────────────────────── activities: new types ───────────────────────────
alter table public.activities drop constraint if exists activities_type_check;
alter table public.activities add constraint activities_type_check
  check (type in (
    'status_change', 'note', 'converted', 'client_created', 'client_linked',
    'project_created', 'stage_change', 'invoice_created', 'payment_received', 'lost',
    'booking_cancelled', 'invoice_updated', 'payment_deleted',
    'invoice_sent', 'invoice_items_updated', 'project_updated'
  ));

-- Make PostgREST pick up the new table/columns immediately instead of
-- failing with PGRST204 until its schema cache happens to refresh.
notify pgrst, 'reload schema';

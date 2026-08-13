-- BSH Solutions — Invoice currency support (PKR, USD, CAD, AUD).
-- Run this once in the Supabase Dashboard → SQL Editor, after 0003_project_extras.sql.
-- Safe to re-run.

alter table public.invoices add column if not exists currency text not null default 'USD'
  check (currency in ('USD', 'PKR', 'CAD', 'AUD'));

-- Re-create the view so `currency` flows through to every place that reads
-- invoice_balances (invoices list, invoice detail, dashboard) — needed so
-- amounts can be formatted/grouped by their actual currency instead of
-- being assumed to all be the same one.
--
-- `currency` is appended LAST, not inserted alongside `total`: Postgres's
-- CREATE OR REPLACE VIEW only allows adding new output columns at the end —
-- it errors (42P16) if you change the position/order of any existing
-- column, which inserting it earlier in the SELECT list would do.
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
  i.currency
from public.invoices i
left join (
  select invoice_id, sum(amount) as paid from public.payments group by invoice_id
) p on p.invoice_id = i.id;

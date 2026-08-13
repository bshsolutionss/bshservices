-- BSH Solutions — Core agency lifecycle: Clients, Projects, Tasks, Invoices,
-- Payments, Activities, and the Lead pipeline expansion (Deal fields merged
-- into `leads` rather than a separate `deals` table — see plan doc).
--
-- Run this once in the Supabase Dashboard → SQL Editor, same as
-- 0001_leads.sql. Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE
-- guards throughout.

-- ─────────────────────────── clients ───────────────────────────
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  company_name text not null,
  contact_name text,
  contact_email text not null,
  contact_phone text,
  industry text,
  account_manager text,          -- free text; no team/roles module yet
  notes text,
  converted_from_lead_id uuid references public.leads(id) on delete set null
);
create index if not exists clients_contact_email_idx on public.clients (lower(contact_email));
alter table public.clients enable row level security;

-- ─────────────────────────── projects ───────────────────────────
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  client_id uuid not null references public.clients(id) on delete restrict,
  lead_id uuid references public.leads(id) on delete set null,   -- traceability; nullable for manually-created projects
  stage text not null default 'planning'
    check (stage in ('planning', 'in_progress', 'review', 'completed')),
  budget numeric(12, 2),
  start_date date,
  due_date date
);
create index if not exists projects_client_id_idx on public.projects (client_id);
create index if not exists projects_lead_id_idx on public.projects (lead_id);
alter table public.projects enable row level security;

-- ─────────────────────────── tasks ───────────────────────────
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  assignee_name text,            -- free text; no users table yet
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high', 'urgent')),
  due_date date,
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'review', 'completed')),
  estimated_hours numeric(6, 2)
);
create index if not exists tasks_project_id_idx on public.tasks (project_id);
create index if not exists tasks_status_idx on public.tasks (status);
alter table public.tasks enable row level security;

-- ─────────────────────────── invoices ───────────────────────────
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  invoice_number text not null unique,
  client_id uuid not null references public.clients(id) on delete restrict,
  project_id uuid references public.projects(id) on delete set null,
  amount numeric(12, 2) not null,
  tax numeric(12, 2) not null default 0,
  discount numeric(12, 2) not null default 0,
  total numeric(12, 2) generated always as (amount + tax - discount) stored,
  due_date date,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'paid', 'partially_paid')),  -- "overdue" is computed, never stored
  notes text
);
create index if not exists invoices_client_id_idx on public.invoices (client_id);
create index if not exists invoices_status_idx on public.invoices (status);
alter table public.invoices enable row level security;

-- ─────────────────────────── payments ───────────────────────────
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount numeric(12, 2) not null,
  paid_on date not null default current_date,
  method text check (method in ('cash', 'bank_transfer', 'card', 'cheque', 'other')),
  reference text
);
create index if not exists payments_invoice_id_idx on public.payments (invoice_id);
alter table public.payments enable row level security;

-- ─────────────────────────── activities (polymorphic timeline) ───────────────────────────
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  entity_type text not null check (entity_type in ('lead', 'client', 'project', 'invoice')),
  entity_id uuid not null,
  type text not null check (type in (
    'status_change', 'note', 'converted', 'client_created', 'client_linked',
    'project_created', 'stage_change', 'invoice_created', 'payment_received', 'lost'
  )),
  description text not null
);
create index if not exists activities_entity_idx on public.activities (entity_type, entity_id, created_at desc);
alter table public.activities enable row level security;

-- ─────────────────────────── invoice_balances view ───────────────────────────
-- Single source of truth for "paid"/"balance"/"is_overdue" — reused by the
-- invoices list, invoice detail page, and the dashboard's outstanding tile,
-- so that math is never duplicated in application code.
create or replace view public.invoice_balances as
select
  i.id as invoice_id,
  i.client_id,
  i.status,
  i.due_date,
  i.total,
  coalesce(p.paid, 0) as paid,
  i.total - coalesce(p.paid, 0) as balance,
  (i.status in ('sent', 'partially_paid') and i.due_date < current_date) as is_overdue
from public.invoices i
left join (
  select invoice_id, sum(amount) as paid from public.payments group by invoice_id
) p on p.invoice_id = i.id;

-- ─────────────────────────── invoice numbering ───────────────────────────
-- Race-safe, collision-safe, single-round-trip sequence per year.
create table if not exists public.invoice_counters (
  year int primary key,
  next_seq int not null default 1
);
alter table public.invoice_counters enable row level security;

create or replace function public.next_invoice_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_year int := extract(year from now())::int;
  v_seq int;
begin
  insert into public.invoice_counters (year, next_seq) values (v_year, 2)
  on conflict (year) do update set next_seq = public.invoice_counters.next_seq + 1
  returning next_seq - 1 into v_seq;
  return 'INV-' || v_year || '-' || lpad(v_seq::text, 4, '0');
end;
$$;

-- Security hardening: Supabase/PostgREST auto-exposes every function as a
-- callable RPC and grants EXECUTE to PUBLIC by default. Since this function
-- is security definer (needed to write invoice_counters regardless of
-- caller), an ungrafted grant would let anyone with just the anon key call
-- it directly over the REST API. Restrict to service_role only — the same
-- access model as every table above (default-deny to anon/authenticated).
revoke execute on function public.next_invoice_number() from public, anon, authenticated;

-- ─────────────────────────── leads: pipeline expansion ───────────────────────────
-- Deal fields merged directly onto leads instead of a separate `deals`
-- table — see plan doc for rationale. A lead with client_id already set
-- represents repeat/upsell business from an existing client.
alter table public.leads add column if not exists expected_value numeric(12, 2);
alter table public.leads add column if not exists priority text not null default 'medium'
  check (priority in ('low', 'medium', 'high', 'urgent'));
alter table public.leads add column if not exists lost_reason text
  check (lost_reason in ('budget', 'timing', 'competitor', 'no_response', 'other'));
alter table public.leads add column if not exists client_id uuid
  references public.clients(id) on delete set null;

-- Expand the pipeline status enum (check constraints, not a Postgres enum
-- type, so this stays a one-line ALTER if the pipeline changes again later).
alter table public.leads drop constraint if exists leads_status_check;
alter table public.leads add constraint leads_status_check
  check (status in ('new', 'contacted', 'qualified', 'meeting', 'proposal_sent', 'negotiation', 'won', 'lost'));

-- ─────────────────────────── won → client + project automation ───────────────────────────
-- "The backbone" per the PRD: marking a lead Won must automatically create
-- the downstream Client + Project instead of manual re-entry. Spans 3
-- tables, so this is a real Postgres function rather than sequential JS
-- writes with manual rollback. Idempotent: locks the lead row, dedupes the
-- client by email (or reuses leads.client_id if already set), dedupes the
-- project by lead_id — calling this again (e.g. re-saving "won") is a safe
-- no-op, so there's no partial-state cleanup to worry about on retry.
create or replace function public.convert_lead_to_client_and_project(p_lead_id uuid)
returns table(out_client_id uuid, out_project_id uuid, client_created boolean, project_created boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead record;
  v_client_id uuid;
  v_project_id uuid;
  v_client_created boolean := false;
  v_project_created boolean := false;
begin
  select * into v_lead from public.leads where id = p_lead_id for update;
  if not found then
    raise exception 'lead % not found', p_lead_id;
  end if;

  if v_lead.client_id is not null then
    v_client_id := v_lead.client_id;
  else
    select id into v_client_id from public.clients
      where lower(contact_email) = lower(v_lead.email) limit 1;
    if v_client_id is null then
      insert into public.clients (company_name, contact_email, contact_phone, industry, converted_from_lead_id)
      values (coalesce(v_lead.business, v_lead.name), v_lead.email, v_lead.phone, v_lead.business_type, v_lead.id)
      returning id into v_client_id;
      v_client_created := true;
    end if;
    update public.leads set client_id = v_client_id where id = p_lead_id;
  end if;

  select id into v_project_id from public.projects where lead_id = p_lead_id limit 1;
  if v_project_id is null then
    insert into public.projects (name, client_id, lead_id, stage, budget)
    values (
      coalesce(v_lead.selected_service, v_lead.service_category, 'New Project')
        || ' — ' || coalesce(v_lead.business, v_lead.name),
      v_client_id, p_lead_id, 'planning', v_lead.expected_value
    )
    returning id into v_project_id;
    v_project_created := true;
  end if;

  return query select v_client_id, v_project_id, v_client_created, v_project_created;
end;
$$;

-- Same hardening as next_invoice_number() — service_role only.
revoke execute on function public.convert_lead_to_client_and_project(uuid) from public, anon, authenticated;

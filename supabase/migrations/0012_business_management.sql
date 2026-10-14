-- BSH Solutions — business management upgrade
--
-- Monthly vs one-time clients/projects, monthly vs one-time expenses,
-- freelancer vs job team members, task assignment by employee (so the
-- assignee can be emailed), manual leads without an email address, richer
-- invoices, an in-panel email connection, and an email log.
--
-- Run once in the Supabase SQL editor. Safe to re-run (IF NOT EXISTS /
-- DROP IF EXISTS guards throughout).

/* ── Clients & projects: monthly vs one-time ─────────────────────────── */

alter table public.clients add column if not exists client_type text not null default 'one_time'
  check (client_type in ('monthly', 'one_time'));
create index if not exists clients_client_type_idx on public.clients (client_type);

alter table public.projects add column if not exists billing_type text not null default 'one_time'
  check (billing_type in ('monthly', 'one_time'));
-- Retainer amount charged every month (monthly projects only).
alter table public.projects add column if not exists monthly_fee numeric(12, 2)
  check (monthly_fee is null or monthly_fee >= 0);
-- Day of the month the retainer invoice is generated (capped at 28 so every month has it).
alter table public.projects add column if not exists billing_day int not null default 1
  check (billing_day between 1 and 28);
-- When on, the daily cron drafts the retainer invoice automatically.
alter table public.projects add column if not exists auto_invoice boolean not null default false;
-- Paused retainers keep their history but stop generating invoices.
alter table public.projects add column if not exists recurring_active boolean not null default true;
create index if not exists projects_billing_type_idx on public.projects (billing_type);

/* ── Team: freelance vs job ──────────────────────────────────────────── */

alter table public.employees add column if not exists employment_type text not null default 'job'
  check (employment_type in ('job', 'freelance'));
alter table public.employees add column if not exists pay_basis text not null default 'monthly'
  check (pay_basis in ('monthly', 'hourly', 'per_project'));
alter table public.employees add column if not exists pay_amount numeric(12, 2)
  check (pay_amount is null or pay_amount >= 0);
alter table public.employees add column if not exists pay_currency text not null default 'PKR'
  check (pay_currency in ('USD', 'PKR', 'CAD', 'AUD'));
create index if not exists employees_employment_type_idx on public.employees (employment_type);

/* ── Tasks: real assignee (so we can email them) ─────────────────────── */

alter table public.tasks add column if not exists assignee_id uuid
  references public.employees(id) on delete set null;
alter table public.tasks add column if not exists assigned_notified_at timestamptz;
create index if not exists tasks_assignee_id_idx on public.tasks (assignee_id);

/* ── Expenses: monthly (recurring) vs one-time ───────────────────────── */

alter table public.expenses add column if not exists expense_type text not null default 'one_time'
  check (expense_type in ('monthly', 'one_time'));
-- On a monthly *template* row: turn off to stop generating future months.
alter table public.expenses add column if not exists recurring_active boolean not null default true;
-- Set on rows the cron generated from a template.
alter table public.expenses add column if not exists recurring_parent_id uuid
  references public.expenses(id) on delete set null;
-- Optional link so project-specific costs roll up per project.
alter table public.expenses add column if not exists project_id uuid
  references public.projects(id) on delete set null;

create index if not exists expenses_type_idx on public.expenses (expense_type);
create index if not exists expenses_project_id_idx on public.expenses (project_id);
-- A template can only produce one row per date, which makes the cron safe to re-run.
create unique index if not exists expenses_recurring_unique
  on public.expenses (recurring_parent_id, expense_date)
  where recurring_parent_id is not null;

/* ── Invoices: periods, terms, send tracking ─────────────────────────── */

alter table public.invoices add column if not exists billing_period text;      -- 'YYYY-MM' for retainer invoices
alter table public.invoices add column if not exists po_number text;
alter table public.invoices add column if not exists terms text;
alter table public.invoices add column if not exists sent_at timestamptz;
alter table public.invoices add column if not exists last_emailed_at timestamptz;
-- One retainer invoice per project per month — the cron can't double-bill.
create unique index if not exists invoices_project_period_unique
  on public.invoices (project_id, billing_period)
  where billing_period is not null;

/* ── Leads: manual entry (email optional, phone-only leads are normal) ── */

alter table public.leads alter column email drop not null;
alter table public.leads add column if not exists website text;
alter table public.leads add column if not exists lead_source_detail text;     -- e.g. "Referral — Ahmed"

/* ── Settings store + email log ──────────────────────────────────────── */

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;

create table if not exists public.email_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  to_email text not null,
  subject text not null,
  kind text not null,
  status text not null check (status in ('sent', 'failed')),
  error text,
  entity_type text,
  entity_id uuid
);
create index if not exists email_log_created_at_idx on public.email_log (created_at desc);
create index if not exists email_log_entity_idx on public.email_log (entity_type, entity_id);
alter table public.email_log enable row level security;

/* ── Activity timeline: new event types ──────────────────────────────── */

alter table public.activities drop constraint if exists activities_type_check;
alter table public.activities add constraint activities_type_check
  check (type in (
    'status_change', 'note', 'converted', 'client_created', 'client_linked',
    'project_created', 'stage_change', 'invoice_created', 'payment_received', 'lost',
    'booking_cancelled', 'invoice_updated', 'payment_deleted',
    'invoice_sent', 'invoice_items_updated', 'project_updated',
    'lead_created', 'invoice_emailed', 'recurring_invoice'
  ));

/* ── Speed: indexes for the lists and filters the admin hits most ───── */

create index if not exists invoices_project_id_idx on public.invoices (project_id);
create index if not exists invoices_due_date_idx on public.invoices (due_date);
create index if not exists payments_paid_on_idx on public.payments (paid_on);
create index if not exists projects_stage_idx on public.projects (stage);
create index if not exists leads_source_idx on public.leads (source);

notify pgrst, 'reload schema';

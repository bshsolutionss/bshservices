-- Retainers, payments hub, project team/domain, task boards.
-- Run in the Supabase SQL editor after 0016. Safe to re-run.

/* ── Projects: domain & hosting renewals, assigned team ──────────────── */

alter table public.projects add column if not exists domain_name text;
alter table public.projects add column if not exists domain_expires_on date;
alter table public.projects add column if not exists hosting_provider text;
alter table public.projects add column if not exists hosting_expires_on date;

create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, employee_id)
);
create index if not exists project_members_employee_idx on public.project_members (employee_id);
alter table public.project_members enable row level security;

/* ── Payments: what kind of payment, and a note ──────────────────────── */

alter table public.payments add column if not exists payment_type text;   -- advance | milestone | regular | final
alter table public.payments add column if not exists notes text;

/* ── Expenses: paid to a team member, and how often an auto expense repeats ── */

alter table public.expenses add column if not exists employee_id uuid references public.employees(id) on delete set null;
alter table public.expenses add column if not exists recurrence text not null default 'monthly'
  check (recurrence in ('monthly', 'quarterly', 'yearly'));
create index if not exists expenses_employee_idx on public.expenses (employee_id);

/* ── Task boards: boards that aren't tied to one client project ──────── */

create table if not exists public.task_boards (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  color text not null default '#3B82F6',
  description text,
  -- optional: a board shared around one client
  client_id uuid references public.clients(id) on delete set null,
  archived boolean not null default false
);
alter table public.task_boards enable row level security;

alter table public.tasks add column if not exists board_id uuid references public.task_boards(id) on delete cascade;
create index if not exists tasks_board_id_idx on public.tasks (board_id);
-- A task now belongs to a project OR to a board.
alter table public.tasks alter column project_id drop not null;
alter table public.tasks drop constraint if exists tasks_owner_check;
alter table public.tasks add constraint tasks_owner_check check (project_id is not null or board_id is not null);

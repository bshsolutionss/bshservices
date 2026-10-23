-- Team members: per-person access, first-login password change, internal progress notes.
-- Run in the Supabase SQL editor after 0017. Safe to re-run.

-- Roles table (normally created by 0014). Created here too, identically, so this file runs even if
-- 0014 was skipped. Safe: "if not exists" leaves an existing table untouched.
create table if not exists public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  role text not null check (role in ('admin', 'manager', 'employee')),
  employee_id uuid references public.employees(id) on delete set null,
  active boolean not null default true
);
create unique index if not exists admin_roles_email_unique on public.admin_roles (lower(email));
alter table public.admin_roles enable row level security;

-- What a team member may see/do inside /team (see lib/team-access.ts). Empty = no extra access.
alter table public.admin_roles add column if not exists access jsonb not null default '{}'::jsonb;
-- Set when an admin creates the login with a temporary password; cleared once they choose their own.
alter table public.admin_roles add column if not exists must_change_password boolean not null default false;

-- The Supabase login this row belongs to (lets an admin reset the password without scanning all users).
alter table public.admin_roles add column if not exists auth_user_id uuid;

-- Progress updates posted by a team member with "internal only" access stay hidden from the client
-- until an admin publishes them.
alter table public.project_updates add column if not exists internal boolean not null default false;
alter table public.project_updates add column if not exists author_name text;

notify pgrst, 'reload schema';

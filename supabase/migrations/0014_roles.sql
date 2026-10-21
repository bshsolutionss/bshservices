-- BSH Solutions - user roles (admin / manager / employee)
--
-- Maps a login (by email) to a role, and optionally to a team member so an
-- employee sees their own tasks. Run once in the Supabase SQL editor, after 0013.
--
-- Backwards compatible: while this table is EMPTY, every signed-in user is an
-- admin (exactly how the panel worked before). The first time you add a user
-- under Settings > Users & roles, you become the admin row automatically.

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

notify pgrst, 'reload schema';

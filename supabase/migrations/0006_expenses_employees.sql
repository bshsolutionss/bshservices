-- BSH Solutions — Expenses and Employees.
-- Run this once in the Supabase Dashboard → SQL Editor, after 0005_consultation_booking.sql.
-- Safe to re-run.

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  category text not null
    check (category in ('Office', 'Software', 'Salaries', 'Advertising', 'Hosting', 'Domain', 'Other')),
  amount numeric(12, 2) not null,
  -- Same currency set as invoices (lib/invoices.ts's Currency type).
  currency text not null default 'USD' check (currency in ('USD', 'PKR', 'CAD', 'AUD')),
  expense_date date not null default current_date,
  vendor text,
  description text
);
create index if not exists expenses_expense_date_idx on public.expenses (expense_date desc);
alter table public.expenses enable row level security;

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text,
  phone text,
  role text,
  department text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  hire_date date,
  notes text
);
create index if not exists employees_status_idx on public.employees (status);
alter table public.employees enable row level security;

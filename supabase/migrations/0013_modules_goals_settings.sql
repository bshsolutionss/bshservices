-- BSH Solutions - modules upgrade
--
-- Dynamic option lists (no more hardcoded categories), goals/targets,
-- investments, personal (own) projects, client communication + templates.
--
-- Run once in the Supabase SQL editor, AFTER 0012. Safe to re-run.

/* ── Dynamic option lists ─────────────────────────────────────────────── */

create table if not exists public.app_options (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  list_key text not null,
  value text not null,
  label text not null,
  color text,
  sort_order int not null default 0,
  active boolean not null default true,
  unique (list_key, value)
);
create index if not exists app_options_list_idx on public.app_options (list_key, sort_order);
alter table public.app_options enable row level security;

-- These columns used to be locked to a fixed list by CHECK constraints; the
-- list is now editable in Settings, so the database must accept any value.
alter table public.expenses drop constraint if exists expenses_category_check;
alter table public.projects drop constraint if exists projects_service_category_check;
alter table public.payments drop constraint if exists payments_method_check;

insert into public.app_options (list_key, value, label, color, sort_order) values
  ('expense_categories', 'Office', 'Office', '#1A14A5', 1),
  ('expense_categories', 'Software', 'Software', '#1E40AF', 2),
  ('expense_categories', 'Salaries', 'Salaries', '#065F46', 3),
  ('expense_categories', 'Advertising', 'Advertising', '#9A3412', 4),
  ('expense_categories', 'Hosting', 'Hosting', '#155E75', 5),
  ('expense_categories', 'Domain', 'Domain', '#5B21B6', 6),
  ('expense_categories', 'Other', 'Other', '#4B5563', 7),
  ('service_categories', 'Development', 'Development', '#1A14A5', 1),
  ('service_categories', 'Designing', 'Designing', '#9D174D', 2),
  ('service_categories', 'Marketing', 'Marketing', '#9A3412', 3),
  ('service_categories', 'Photography', 'Photography', '#155E75', 4),
  ('service_categories', 'AI Services', 'AI Services', '#5B21B6', 5),
  ('lead_sources', 'Phone call', 'Phone call', null, 1),
  ('lead_sources', 'WhatsApp', 'WhatsApp', null, 2),
  ('lead_sources', 'Referral', 'Referral', null, 3),
  ('lead_sources', 'Facebook', 'Facebook', null, 4),
  ('lead_sources', 'Instagram', 'Instagram', null, 5),
  ('lead_sources', 'LinkedIn', 'LinkedIn', null, 6),
  ('lead_sources', 'Cold email', 'Cold email', null, 7),
  ('lead_sources', 'Fiverr / Upwork', 'Fiverr / Upwork', null, 8),
  ('lead_sources', 'Walk-in / event', 'Walk-in / event', null, 9),
  ('lead_sources', 'Other', 'Other', null, 10),
  ('investment_types', 'Stocks', 'Stocks', '#1E40AF', 1),
  ('investment_types', 'Crypto', 'Crypto', '#9A3412', 2),
  ('investment_types', 'Real estate', 'Real estate', '#065F46', 3),
  ('investment_types', 'Business', 'Business / startup', '#5B21B6', 4),
  ('investment_types', 'Gold', 'Gold', '#92400E', 5),
  ('investment_types', 'Savings', 'Savings / fixed deposit', '#155E75', 6),
  ('investment_types', 'Other', 'Other', '#4B5563', 7),
  ('payment_methods', 'cash', 'Cash', null, 1),
  ('payment_methods', 'bank_transfer', 'Bank transfer', null, 2),
  ('payment_methods', 'card', 'Card', null, 3),
  ('payment_methods', 'cheque', 'Cheque', null, 4),
  ('payment_methods', 'other', 'Other', null, 5)
on conflict (list_key, value) do nothing;

/* ── Goals / targets ──────────────────────────────────────────────────── */

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  -- Built-in metrics are computed live from the data; 'custom' is tracked by hand.
  metric text not null,
  period_type text not null check (period_type in ('monthly', 'yearly')),
  -- 'YYYY-MM' for monthly, 'YYYY' for yearly.
  period_key text not null,
  target_value numeric(14, 2) not null check (target_value >= 0),
  -- Only used by 'custom' goals.
  current_value numeric(14, 2) not null default 0,
  unit text,
  notes text
);
create index if not exists goals_period_idx on public.goals (period_type, period_key);
create unique index if not exists goals_builtin_unique
  on public.goals (metric, period_key) where metric <> 'custom';
alter table public.goals enable row level security;

/* ── Investments ──────────────────────────────────────────────────────── */

create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  investment_type text,
  currency text not null default 'PKR' check (currency in ('USD', 'PKR', 'CAD', 'AUD')),
  invested_amount numeric(14, 2) not null default 0 check (invested_amount >= 0),
  current_value numeric(14, 2) not null default 0 check (current_value >= 0),
  invested_on date not null default current_date,
  status text not null default 'active' check (status in ('active', 'sold', 'closed')),
  expected_return_pct numeric(6, 2),
  notes text
);
create index if not exists investments_status_idx on public.investments (status);
alter table public.investments enable row level security;

-- Income received from an investment (dividends, rent, profit share, sale proceeds).
create table if not exists public.investment_returns (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  investment_id uuid not null references public.investments(id) on delete cascade,
  amount numeric(14, 2) not null check (amount > 0),
  received_on date not null default current_date,
  note text
);
create index if not exists investment_returns_investment_idx on public.investment_returns (investment_id, received_on desc);
alter table public.investment_returns enable row level security;

/* ── Personal (own) projects ──────────────────────────────────────────── */

create table if not exists public.personal_projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  description text,
  status text not null default 'idea' check (status in ('idea', 'building', 'launched', 'paused', 'abandoned')),
  url text,
  currency text not null default 'PKR' check (currency in ('USD', 'PKR', 'CAD', 'AUD')),
  start_date date,
  target_date date,
  notes text
);
create index if not exists personal_projects_status_idx on public.personal_projects (status);
alter table public.personal_projects enable row level security;

create table if not exists public.personal_project_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_id uuid not null references public.personal_projects(id) on delete cascade,
  kind text not null check (kind in ('cost', 'revenue')),
  amount numeric(14, 2) not null check (amount > 0),
  entry_date date not null default current_date,
  description text
);
create index if not exists personal_project_entries_project_idx on public.personal_project_entries (project_id, entry_date desc);
alter table public.personal_project_entries enable row level security;

/* ── Client communication ─────────────────────────────────────────────── */

create table if not exists public.communications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid references public.clients(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  channel text not null check (channel in ('call', 'email', 'whatsapp', 'meeting', 'note', 'other')),
  direction text not null default 'outbound' check (direction in ('inbound', 'outbound')),
  subject text,
  summary text,
  occurred_at timestamptz not null default now(),
  follow_up_on date,
  follow_up_done boolean not null default false
);
create index if not exists communications_client_idx on public.communications (client_id, occurred_at desc);
create index if not exists communications_followup_idx on public.communications (follow_up_on) where follow_up_done = false and follow_up_on is not null;
alter table public.communications enable row level security;

create table if not exists public.message_templates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  subject text,
  body text not null,
  sort_order int not null default 0
);
alter table public.message_templates enable row level security;

insert into public.message_templates (name, subject, body, sort_order)
select * from (values
  ('Project update', 'Update on {{project}}', E'Hi {{name}},\n\nQuick update on {{project}}: \n\nLet me know if you have any questions.\n\nRegards,\nBSH Solutions', 1),
  ('Payment reminder', 'Payment reminder', E'Hi {{name}},\n\nA gentle reminder that your invoice is due. Please let us know once the payment is made.\n\nThank you,\nBSH Solutions', 2),
  ('Follow-up', 'Following up', E'Hi {{name}},\n\nJust following up on our last conversation. Is there anything you need from us?\n\nRegards,\nBSH Solutions', 3)
) as t(name, subject, body, sort_order)
where not exists (select 1 from public.message_templates);

notify pgrst, 'reload schema';

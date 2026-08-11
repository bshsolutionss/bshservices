-- BSH Solutions — Leads table
-- Run this once in the Supabase Dashboard → SQL Editor (or via `supabase db push`
-- if you have the CLI linked to this project). Safe to re-run: uses IF NOT EXISTS
-- / CREATE OR REPLACE guards throughout.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Form fields (superset of both site forms)
  name text not null,
  email text not null,
  phone text,
  business text,
  best_time text,
  message text,
  service_category text,   -- e.g. "Development", "AI Services"
  selected_service text,   -- e.g. "Website Development"
  business_type text,      -- e.g. "E-commerce", "Agency / Company"

  -- Funnel / attribution
  source text not null,    -- 'contact_form' | 'service_form'
  page_path text,

  -- Pipeline status
  status text not null default 'new'
    check (status in ('new', 'contacted', 'qualified', 'won', 'lost')),
  status_updated_at timestamptz not null default now(),
  notes text,

  -- Email delivery tracking
  client_confirmation_sent_at timestamptz,
  admin_notified_at timestamptz,

  -- Automated follow-up loop
  next_follow_up_at timestamptz,
  follow_up_stage int not null default 0,
  follow_up_completed boolean not null default false
);

create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_next_follow_up_at_idx on public.leads (next_follow_up_at);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- Row Level Security: default-deny. No policies are granted to `anon` or
-- `authenticated` roles — every insert/read/update goes through server-side
-- code using the service_role key (see lib/supabase/service.ts), which
-- bypasses RLS by design and never reaches the browser. This means even a
-- leaked anon/publishable key cannot read or write this table at all.
alter table public.leads enable row level security;

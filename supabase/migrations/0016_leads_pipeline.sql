-- Leads: editable pipeline stages, assignee/location, collect-with-a-link forms,
-- and inbound lead sources (webhook, Google Ads, IndiaMART, website form).
-- Run in the Supabase SQL editor after 0015. Safe to re-run.

/* ── Editable pipeline stages ────────────────────────────────────────── */

create table if not exists public.lead_stages (
  key text primary key,
  label text not null,
  color text not null default '#6366f1',
  position integer not null default 0,
  -- 'won' stages convert the lead to a client + project; 'lost' stages ask for a reason.
  kind text not null default 'open' check (kind in ('open', 'won', 'lost')),
  created_at timestamptz not null default now()
);
alter table public.lead_stages enable row level security;

insert into public.lead_stages (key, label, color, position, kind) values
  ('new',           'New',           '#60a5fa', 0, 'open'),
  ('contacted',     'Contacted',     '#c084fc', 1, 'open'),
  ('qualified',     'Qualified',     '#fbbf24', 2, 'open'),
  ('meeting',       'Meeting',       '#8b5cf6', 3, 'open'),
  ('proposal_sent', 'Proposal Sent', '#fb923c', 4, 'open'),
  ('negotiation',   'Negotiation',   '#f97316', 5, 'open'),
  ('won',           'Won',           '#34d399', 6, 'won'),
  ('lost',          'Lost',          '#f87171', 7, 'lost')
on conflict (key) do nothing;

-- Stage keys are now data, not a fixed list.
alter table public.leads drop constraint if exists leads_status_check;

/* ── New lead fields ─────────────────────────────────────────────────── */

alter table public.leads add column if not exists assigned_to uuid references public.employees(id) on delete set null;
alter table public.leads add column if not exists location text;
-- Answers to a form's custom questions / unmapped webhook fields, so nothing a visitor tells you is lost.
alter table public.leads add column if not exists extra jsonb not null default '{}'::jsonb;
-- A manual "call them on..." reminder. Separate from next_follow_up_at, which drives the automatic nurture emails.
alter table public.leads add column if not exists reminder_at timestamptz;
create index if not exists leads_assigned_to_idx on public.leads (assigned_to);

/* ── Collect leads with a link ───────────────────────────────────────── */

create table if not exists public.lead_forms (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slug text not null unique,
  name text not null,
  heading text not null default 'Get in touch',
  intro text,
  thank_you text,
  -- [{ id, label, type: name|phone|email|company|location|budget|text, required }]
  questions jsonb not null default '[]'::jsonb,
  -- null = first stage of the pipeline
  stage_key text,
  active boolean not null default true
);
alter table public.lead_forms enable row level security;

alter table public.leads add column if not exists form_id uuid references public.lead_forms(id) on delete set null;
create index if not exists leads_form_id_idx on public.leads (form_id);

/* ── Inbound lead sources ────────────────────────────────────────────── */

create table if not exists public.lead_sources (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- website | google_ads | indiamart | webhook
  type text not null check (type in ('website', 'google_ads', 'indiamart', 'webhook')),
  name text not null,
  -- the secret in the endpoint URL: /api/lead-sources/<token>
  token text not null unique,
  stage_key text,
  active boolean not null default true,
  last_lead_at timestamptz
);
alter table public.lead_sources enable row level security;

alter table public.leads add column if not exists source_id uuid references public.lead_sources(id) on delete set null;
create index if not exists leads_source_id_idx on public.leads (source_id);

/* ── Activity timeline ───────────────────────────────────────────────── */

alter table public.activities drop constraint if exists activities_type_check;
alter table public.activities add constraint activities_type_check
  check (type in (
    'status_change', 'note', 'converted', 'client_created', 'client_linked',
    'project_created', 'stage_change', 'invoice_created', 'payment_received', 'lost',
    'booking_cancelled', 'invoice_updated', 'payment_deleted',
    'invoice_sent', 'invoice_items_updated', 'project_updated',
    'lead_created', 'invoice_emailed', 'recurring_invoice',
    'portal_invited', 'portal_approval', 'portal_request', 'portal_referral', 'portal_review',
    'lead_assigned'
  ));

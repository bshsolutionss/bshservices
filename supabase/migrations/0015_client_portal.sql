-- Client portal: logins for clients, chat, approvals, change requests, meetings,
-- documents, referrals, reviews, notifications.
--
-- Same security model as every other table in this project: RLS is ON with no
-- policies, so the anon/authenticated keys can read nothing. The portal's own
-- server code uses the service-role key and ALWAYS scopes queries to the signed-in
-- client's client_id (lib/portal/session.ts). Run this in the Supabase SQL editor
-- after 0014.

/* ── Who may sign in to the portal, and for which client ─────────────── */

create table if not exists public.client_users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references public.clients(id) on delete cascade,
  auth_user_id uuid not null unique,
  email text not null,
  name text,
  active boolean not null default true,
  last_seen_at timestamptz,
  -- ids of the welcome-checklist items this person has ticked + wizard state
  onboarding jsonb not null default '{}'::jsonb
);
create unique index if not exists client_users_email_idx on public.client_users (lower(email));
create index if not exists client_users_client_idx on public.client_users (client_id);
alter table public.client_users enable row level security;

/* ── What the client is allowed to see ───────────────────────────────── */

alter table public.projects add column if not exists portal_visible boolean not null default true;
-- Tasks are internal by default: only ones explicitly shared show in the portal.
alter table public.tasks add column if not exists client_visible boolean not null default false;

create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  body text
);
create index if not exists project_updates_project_idx on public.project_updates (project_id, created_at desc);
alter table public.project_updates enable row level security;

/* ── Messages ────────────────────────────────────────────────────────── */

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  last_message_at timestamptz not null default now()
);
create index if not exists conversations_client_idx on public.conversations (client_id, last_message_at desc);
alter table public.conversations enable row level security;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_type text not null check (sender_type in ('client', 'admin')),
  sender_name text,
  body text,
  attachment_path text,
  attachment_name text,
  attachment_type text,
  -- set when the OTHER side opens the conversation
  read_at timestamptz
);
create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);
create index if not exists messages_unread_idx on public.messages (conversation_id, sender_type) where read_at is null;
alter table public.messages enable row level security;

/* ── Approvals, change requests ──────────────────────────────────────── */

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text,
  link_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'changes_requested')),
  client_comment text,
  responded_at timestamptz,
  responded_by text
);
create index if not exists approvals_client_idx on public.approvals (client_id, status);
alter table public.approvals enable row level security;

create table if not exists public.change_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  details text,
  requested_by text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'done', 'declined')),
  task_id uuid references public.tasks(id) on delete set null
);
create index if not exists change_requests_client_idx on public.change_requests (client_id, status);
alter table public.change_requests enable row level security;

/* ── Meetings and documents ──────────────────────────────────────────── */

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  starts_at timestamptz not null,
  duration_minutes integer not null default 30,
  link_url text,
  agenda text,
  notes text,
  recording_url text,
  status text not null default 'scheduled' check (status in ('scheduled', 'held', 'cancelled'))
);
create index if not exists meetings_client_idx on public.meetings (client_id, starts_at desc);
alter table public.meetings enable row level security;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  -- quotation / contract / deliverable / other: free text, editable like the other lists
  category text not null default 'other',
  storage_path text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  uploaded_by text not null default 'admin' check (uploaded_by in ('admin', 'client')),
  shared boolean not null default true
);
create index if not exists documents_client_idx on public.documents (client_id, created_at desc);
alter table public.documents enable row level security;

/* ── Referrals, reviews ──────────────────────────────────────────────── */

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references public.clients(id) on delete cascade,
  referred_name text not null,
  referred_phone text not null,
  referred_email text,
  note text,
  -- Indian/Pakistani data-protection rules: the client confirms they asked first.
  consent_confirmed boolean not null default false,
  consent_at timestamptz,
  lead_id uuid references public.leads(id) on delete set null
);
alter table public.referrals enable row level security;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  kind text not null default 'project' check (kind in ('project', 'testimonial')),
  rating integer check (rating between 1 and 5),
  body text,
  display_name text,
  -- testimonials are only public once approved
  approved boolean not null default false
);
create index if not exists reviews_client_idx on public.reviews (client_id, created_at desc);
alter table public.reviews enable row level security;

/* ── Bell notifications (both directions) ────────────────────────────── */

create table if not exists public.portal_notifications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null,
  body text,
  href text,
  read_at timestamptz
);
create index if not exists portal_notifications_client_idx on public.portal_notifications (client_id, created_at desc);
alter table public.portal_notifications enable row level security;

/* ── Activity timeline: portal events ────────────────────────────────── */

alter table public.activities drop constraint if exists activities_type_check;
alter table public.activities add constraint activities_type_check
  check (type in (
    'status_change', 'note', 'converted', 'client_created', 'client_linked',
    'project_created', 'stage_change', 'invoice_created', 'payment_received', 'lost',
    'booking_cancelled', 'invoice_updated', 'payment_deleted',
    'invoice_sent', 'invoice_items_updated', 'project_updated',
    'lead_created', 'invoice_emailed', 'recurring_invoice',
    'portal_invited', 'portal_approval', 'portal_request', 'portal_referral', 'portal_review'
  ));

/* ── Private file storage for documents and chat attachments ─────────── */

insert into storage.buckets (id, name, public)
values ('portal-files', 'portal-files', false)
on conflict (id) do nothing;

-- BSH Solutions — Book a Consultation system.
-- Run this once in the Supabase Dashboard → SQL Editor, after 0004_invoice_currency.sql.
-- Safe to re-run.

-- Bookings are leads with a date/time attached (source='consultation_booking'),
-- not a separate table — see plan doc for rationale.
alter table public.leads add column if not exists booking_date date;
alter table public.leads add column if not exists booking_time time;
alter table public.leads add column if not exists booking_status text
  check (booking_status in ('confirmed', 'cancelled'));

-- Double-booking prevention at the DB layer, not just in application logic
-- (which can race between two concurrent submissions). Partial index: only
-- covers confirmed consultation bookings, so cancelling one frees the slot
-- back up automatically, and non-booking leads (booking_date is null) are
-- unaffected.
create unique index if not exists leads_booking_slot_unique
  on public.leads (booking_date, booking_time)
  where source = 'consultation_booking' and booking_status = 'confirmed';

-- ─────────────────────────── availability ───────────────────────────
-- Recurring weekly rule: one row per day-of-week that's open for booking.
create table if not exists public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  day_of_week int not null check (day_of_week between 0 and 6), -- 0 = Sunday
  start_time time not null,
  end_time time not null check (end_time > start_time),
  slot_duration_minutes int not null default 30 check (slot_duration_minutes > 0),
  is_active boolean not null default true
);
create index if not exists availability_rules_day_idx on public.availability_rules (day_of_week);
alter table public.availability_rules enable row level security;

-- Date-specific exceptions: block a whole day (holiday) or a sub-range
-- within a day (null start/end = whole day).
create table if not exists public.availability_blocks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  block_date date not null,
  start_time time,
  end_time time,
  reason text
);
create index if not exists availability_blocks_date_idx on public.availability_blocks (block_date);
alter table public.availability_blocks enable row level security;

-- Extend the activities timeline to cover booking cancellation.
alter table public.activities drop constraint if exists activities_type_check;
alter table public.activities add constraint activities_type_check
  check (type in (
    'status_change', 'note', 'converted', 'client_created', 'client_linked',
    'project_created', 'stage_change', 'invoice_created', 'payment_received', 'lost',
    'booking_cancelled'
  ));

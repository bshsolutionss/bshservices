-- BSH Solutions — Website chatbot: shared daily usage counter.
-- Run this once in the Supabase Dashboard → SQL Editor, after
-- 0010_invoice_items.sql. Safe to re-run.
--
-- WHY: the chatbot runs on Gemini's FREE tier, which is capped per day
-- (requests-per-day, reset at midnight Pacific). The existing in-memory
-- limiter in lib/rate-limit.ts cannot protect that cap on Vercel: each warm
-- serverless instance keeps its own counters, so traffic spread across
-- instances can blow through the daily quota even though no single instance
-- saw abuse. Google's answer to an exhausted quota is a 429, which would
-- degrade every visitor to keyword answers for the rest of the day.
--
-- So the day's model-call count lives here instead — one row per day, shared
-- by every instance. app/api/chat claims a call before spending it, and once
-- the budget is gone it serves the keyword fallback for the remainder of the
-- day rather than hammering an endpoint that is only going to refuse.
--
-- The same row doubles as usage reporting: how many conversations the bot
-- actually handled, how often it fell back, and how many leads it captured.

create table if not exists public.chatbot_usage (
  -- Pacific date, matching the free tier's own quota reset boundary, so a
  -- row lines up exactly with the quota it is tracking.
  day date primary key,
  -- Calls actually sent to the model (the metered thing).
  model_calls integer not null default 0,
  -- Answers served from lib/chatbot/fallback.ts instead — because the
  -- budget was spent, no key is set, or the upstream call failed.
  fallback_calls integer not null default 0,
  -- Conversations that produced a row in `leads`.
  leads_captured integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.chatbot_usage enable row level security;
-- No policies on purpose: like every other table here, access is
-- service_role only (the API routes), default-deny for anon/authenticated.

-- ─────────────────────────── claim a model call ───────────────────────────
--
-- Atomically increments the day's counter and reports whether the call is
-- within budget. A single INSERT ... ON CONFLICT does the test and the
-- increment in one statement, so two concurrent requests can never both
-- claim the last remaining call.
--
-- Returns true when the caller may spend a model call, false when the
-- day's budget is already used up.
create or replace function public.claim_chatbot_model_call(p_day date, p_limit integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_allowed boolean;
begin
  insert into public.chatbot_usage as u (day, model_calls)
  values (p_day, 1)
  on conflict (day) do update
    set model_calls = u.model_calls + 1,
        updated_at = now()
    -- The guard: no row comes back when the day is already at its limit,
    -- and the counter is left untouched.
    where u.model_calls < p_limit
  returning true into v_allowed;

  return coalesce(v_allowed, false);
end;
$$;

-- ─────────────────────────── record an outcome ───────────────────────────
--
-- Fire-and-forget bookkeeping for the non-metered outcomes, so the daily row
-- tells the whole story without a second table.
create or replace function public.record_chatbot_outcome(
  p_day date,
  p_fallback integer default 0,
  p_lead integer default 0
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.chatbot_usage as u (day, fallback_calls, leads_captured)
  values (p_day, greatest(p_fallback, 0), greatest(p_lead, 0))
  on conflict (day) do update
    set fallback_calls = u.fallback_calls + greatest(p_fallback, 0),
        leads_captured = u.leads_captured + greatest(p_lead, 0),
        updated_at = now();
end;
$$;

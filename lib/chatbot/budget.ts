/**
 * Daily model-call budget, shared across serverless instances.
 *
 * The in-memory limiter in lib/rate-limit.ts stops one visitor hammering one
 * warm instance, but it can't see the whole day across instances — and the
 * thing that actually needs protecting is Gemini's free-tier
 * requests-per-day cap. That count lives in Postgres instead (see
 * supabase/migrations/0011_chatbot_usage.sql), claimed atomically before each
 * call is spent.
 *
 * Deliberately fails OPEN: if the table or function is missing (migration
 * not run yet) or Supabase is unreachable, the chatbot keeps answering rather
 * than going dark over its own bookkeeping. The worst case is falling back to
 * Google's own 429, which the route already handles.
 */

import { createServiceRoleClient } from "@/lib/supabase/service";
import { DAILY_MODEL_CALL_BUDGET } from "@/lib/chatbot/config";

/** The free tier resets its daily quota at midnight Pacific, so the counter
 *  is bucketed by Pacific date — not UTC, and not server-local time. */
export function quotaDay(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

let warnedMissingTable = false;

function warnOnce(error: unknown): void {
  if (warnedMissingTable) return;
  warnedMissingTable = true;
  console.warn(
    "[chatbot/budget] usage counter unavailable — the daily budget is NOT being enforced. " +
      "Run supabase/migrations/0011_chatbot_usage.sql. Cause:",
    error
  );
}

/**
 * Reserves one model call against today's budget.
 * Returns false only when the budget is provably spent.
 */
export async function claimModelCall(): Promise<boolean> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.rpc("claim_chatbot_model_call", {
      p_day: quotaDay(),
      p_limit: DAILY_MODEL_CALL_BUDGET,
    });

    if (error) {
      warnOnce(error.message);
      return true; // fail open
    }

    return data !== false;
  } catch (err) {
    warnOnce(err);
    return true; // fail open
  }
}

export interface ChatbotUsage {
  day: string;
  model_calls: number;
  fallback_calls: number;
  leads_captured: number;
  budget: number;
  remaining: number;
}

/** Today's counters, for the GET /api/chat self-check. Null when the usage
 *  table isn't there yet. */
export async function getUsage(): Promise<ChatbotUsage | null> {
  try {
    const supabase = createServiceRoleClient();
    const day = quotaDay();
    const { data, error } = await supabase
      .from("chatbot_usage")
      .select("day, model_calls, fallback_calls, leads_captured")
      .eq("day", day)
      .maybeSingle();

    if (error) {
      warnOnce(error.message);
      return null;
    }

    const modelCalls = data?.model_calls ?? 0;
    return {
      day,
      model_calls: modelCalls,
      fallback_calls: data?.fallback_calls ?? 0,
      leads_captured: data?.leads_captured ?? 0,
      budget: DAILY_MODEL_CALL_BUDGET,
      remaining: Math.max(DAILY_MODEL_CALL_BUDGET - modelCalls, 0),
    };
  } catch (err) {
    warnOnce(err);
    return null;
  }
}

/**
 * Bookkeeping for outcomes that cost no quota. Never awaited by the request
 * path — a failed counter update must not slow down or break a reply.
 */
export function recordOutcome(outcome: { fallback?: boolean; lead?: boolean }): void {
  if (!outcome.fallback && !outcome.lead) return;

  void (async () => {
    try {
      const supabase = createServiceRoleClient();
      const { error } = await supabase.rpc("record_chatbot_outcome", {
        p_day: quotaDay(),
        p_fallback: outcome.fallback ? 1 : 0,
        p_lead: outcome.lead ? 1 : 0,
      });
      if (error) warnOnce(error.message);
    } catch (err) {
      warnOnce(err);
    }
  })();
}

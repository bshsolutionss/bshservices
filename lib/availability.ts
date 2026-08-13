import { createServiceRoleClient } from "@/lib/supabase/service";

/** Shared types for admin-managed availability — mirrors lib/leads.ts's shape. */

export interface AvailabilityRule {
  id: string;
  created_at: string;
  day_of_week: number; // 0 = Sunday .. 6 = Saturday
  start_time: string; // "HH:MM:SS"
  end_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
}

export interface AvailabilityBlock {
  id: string;
  created_at: string;
  block_date: string; // "YYYY-MM-DD"
  start_time: string | null; // null start+end = whole day blocked
  end_time: string | null;
  reason: string | null;
}

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const BOOKING_HORIZON_DAYS = 60;

/**
 * Business operates in one city/timezone (Karachi, PKT = UTC+5, no DST) —
 * this whole system deliberately avoids per-visitor timezone conversion
 * (see plan doc). Shifting `Date.now()` by the fixed PKT offset and reading
 * the UTC parts back out is a cheap, correct way to get "today in PKT"
 * without depending on the server's own TZ setting (Vercel runs in UTC).
 */
function nowInPkt(): Date {
  return new Date(Date.now() + 5 * 60 * 60 * 1000);
}

/** "YYYY-MM-DD" for today in PKT — reused wherever "is this booking upcoming or past" is decided. */
export function todayInPkt(): string {
  return nowInPkt().toISOString().slice(0, 10);
}

/** Parses a strict "YYYY-MM-DD" string into a UTC-based Date, rejecting invalid calendar dates (e.g. Feb 30). */
export function parseDateOnly(dateStr: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  if (
    date.getUTCFullYear() !== Number(y) ||
    date.getUTCMonth() !== Number(m) - 1 ||
    date.getUTCDate() !== Number(d)
  ) {
    return null;
  }
  return date;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/** Is this date bookable at all — not in the past, not beyond the horizon? */
export function isDateBookable(dateStr: string): boolean {
  const date = parseDateOnly(dateStr);
  if (!date) return false;

  const today = nowInPkt();
  const todayUtcMidnight = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const horizon = todayUtcMidnight + BOOKING_HORIZON_DAYS * 24 * 60 * 60 * 1000;

  return date.getTime() >= todayUtcMidnight && date.getTime() <= horizon;
}

/**
 * Computes open time slots for a given date: weekly rule → generate
 * candidates → subtract date-specific blocks → subtract already-confirmed
 * bookings. Runs entirely server-side (never client-computed) since it
 * needs to see the admin's schedule and other visitors' bookings, neither
 * of which the client should have direct access to.
 *
 * Degrades to an empty list (never throws) if the availability tables
 * don't exist yet — e.g. the migration hasn't been run in this environment
 * yet. A silent empty result plus a clear "temporarily unavailable" message
 * on the public page is far better than an unhandled crash (see the
 * `formatMoney` production incident this mirrors the fix for).
 */
export async function computeAvailableSlots(dateStr: string): Promise<string[]> {
  if (!isDateBookable(dateStr)) return [];

  try {
    const supabase = createServiceRoleClient();
    const date = parseDateOnly(dateStr)!;
    const dayOfWeek = date.getUTCDay();

    const [{ data: rules, error: rulesError }, { data: blocks, error: blocksError }, { data: booked, error: bookedError }] =
      await Promise.all([
        supabase
          .from("availability_rules")
          .select("*")
          .eq("day_of_week", dayOfWeek)
          .eq("is_active", true),
        supabase.from("availability_blocks").select("*").eq("block_date", dateStr),
        supabase
          .from("leads")
          .select("booking_time")
          .eq("source", "consultation_booking")
          .eq("booking_date", dateStr)
          .eq("booking_status", "confirmed"),
      ]);

    if (rulesError || blocksError || bookedError) {
      console.error("[availability] query failed:", rulesError || blocksError || bookedError);
      return [];
    }

    const candidateMinutes = new Set<number>();
    for (const rule of (rules ?? []) as AvailabilityRule[]) {
      const start = timeToMinutes(rule.start_time);
      const end = timeToMinutes(rule.end_time);
      for (let m = start; m + rule.slot_duration_minutes <= end; m += rule.slot_duration_minutes) {
        candidateMinutes.add(m);
      }
    }

    for (const block of (blocks ?? []) as AvailabilityBlock[]) {
      if (!block.start_time || !block.end_time) {
        candidateMinutes.clear();
        break;
      }
      const blockStart = timeToMinutes(block.start_time);
      const blockEnd = timeToMinutes(block.end_time);
      for (const m of Array.from(candidateMinutes)) {
        if (m >= blockStart && m < blockEnd) candidateMinutes.delete(m);
      }
    }

    const bookedMinutes = new Set(
      ((booked ?? []) as { booking_time: string }[]).map((b) => timeToMinutes(b.booking_time))
    );
    for (const m of bookedMinutes) candidateMinutes.delete(m);

    return Array.from(candidateMinutes)
      .sort((a, b) => a - b)
      .map(minutesToTime);
  } catch (err) {
    console.error("[availability] computeAvailableSlots failed:", err);
    return [];
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { sendFollowUpEmail } from "@/lib/email/resend";
import type { Lead } from "@/lib/leads";

const DAY_MS = 24 * 60 * 60 * 1000;

// stage after sending -> { next follow-up delay from created_at, or null if the sequence is done }
const STAGE_AFTER_SEND: Record<number, { nextDelayDays: number | null }> = {
  1: { nextDelayDays: 3 }, // Day 1 email just sent → next due Day 3
  2: { nextDelayDays: 7 }, // Day 3 email just sent → next due Day 7
  3: { nextDelayDays: null }, // Day 7 email just sent → sequence complete
};

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  const querySecret = request.nextUrl.searchParams.get("secret");
  return querySecret === secret;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("follow_up_completed", false)
    .in("status", ["new", "contacted"])
    .lte("next_follow_up_at", new Date().toISOString())
    .limit(100);

  if (error) {
    console.error("[cron/follow-ups] query failed:", error);
    return NextResponse.json({ ok: false, error: "Query failed." }, { status: 500 });
  }

  const dueLeads = (data ?? []) as Lead[];
  let sent = 0;
  let failed = 0;

  for (const lead of dueLeads) {
    const stage = (lead.follow_up_stage + 1) as 1 | 2 | 3;
    const success = await sendFollowUpEmail(lead, stage);

    if (!success) {
      failed++;
      continue;
    }

    sent++;
    const next = STAGE_AFTER_SEND[stage];
    const updates: Record<string, unknown> = { follow_up_stage: stage };

    if (next.nextDelayDays === null) {
      updates.follow_up_completed = true;
      updates.next_follow_up_at = null;
    } else {
      updates.next_follow_up_at = new Date(
        new Date(lead.created_at).getTime() + next.nextDelayDays * DAY_MS
      ).toISOString();
    }

    await supabase.from("leads").update(updates).eq("id", lead.id);
  }

  return NextResponse.json({ ok: true, due: dueLeads.length, sent, failed });
}

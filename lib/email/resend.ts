import { Resend } from "resend";
import type { Lead } from "@/lib/leads";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { adminNotificationEmail, clientConfirmationEmail, followUpEmail } from "@/lib/email/templates";

const RESEND_API_KEY = process.env.RESEND_API_KEY || process.env.RESEND_API || "";

const FROM = "BSH Solutions <info@bshsolutionss.com>";
const ADMIN_EMAIL = "bshsolutionss@gmail.com";

function getResendClient(): Resend {
  if (!RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY (or RESEND_API) environment variable.");
  }
  return new Resend(RESEND_API_KEY);
}

/**
 * Sends the client confirmation + admin notification for a newly-created
 * lead. Both sends are independent (`Promise.allSettled`) — one failing
 * must never block the other, and this function must never throw in a way
 * that would fail the caller's HTTP response (the lead row is already
 * saved by the time this runs; see app/api/leads/route.ts).
 */
export async function sendLeadEmails(lead: Lead): Promise<void> {
  const resend = getResendClient();

  const [clientResult, adminResult] = await Promise.allSettled([
    resend.emails.send({
      from: FROM,
      to: lead.email,
      replyTo: ADMIN_EMAIL,
      ...clientConfirmationEmail(lead),
    }),
    resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      replyTo: lead.email,
      ...adminNotificationEmail(lead),
    }),
  ]);

  if (clientResult.status === "rejected") {
    console.error("[email] client confirmation failed:", clientResult.reason);
  }
  if (adminResult.status === "rejected") {
    console.error("[email] admin notification failed:", adminResult.reason);
  }

  // Best-effort delivery timestamps — never let this throw into the caller.
  try {
    const supabase = createServiceRoleClient();
    const updates: Record<string, string> = {};
    if (clientResult.status === "fulfilled") {
      updates.client_confirmation_sent_at = new Date().toISOString();
    }
    if (adminResult.status === "fulfilled") {
      updates.admin_notified_at = new Date().toISOString();
    }
    if (Object.keys(updates).length > 0) {
      await supabase.from("leads").update(updates).eq("id", lead.id);
    }
  } catch (err) {
    console.error("[email] failed to record delivery timestamps:", err);
  }
}

/** Used only by the follow-up cron route. */
export async function sendFollowUpEmail(lead: Lead, stage: 1 | 2 | 3): Promise<boolean> {
  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: FROM,
      to: lead.email,
      replyTo: ADMIN_EMAIL,
      ...followUpEmail(lead, stage),
    });
    return true;
  } catch (err) {
    console.error(`[email] follow-up stage ${stage} failed for lead ${lead.id}:`, err);
    return false;
  }
}

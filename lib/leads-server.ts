/**
 * Server-side lead persistence, shared by every funnel that creates a lead
 * (the contact/service forms in app/api/leads and the site chatbot in
 * app/api/chat). Keeping it in one place means scoring, field limits, the
 * day-1 follow-up timer, the confirmation emails, and the admin push
 * notification can't drift apart between entry points.
 *
 * Callers are responsible for validating/authorizing the request (honeypot,
 * rate limit, required fields) before calling this.
 */

import { createServiceRoleClient } from "@/lib/supabase/service";
import { sendLeadEmails } from "@/lib/email/resend";
import { sendAdminPush } from "@/lib/push";
import { scoreLead } from "@/lib/lead-scoring";
import type { Lead, LeadSource } from "@/lib/leads";

const FOLLOW_UP_DELAY_MS = 24 * 60 * 60 * 1000; // Day 1

export interface SaveLeadInput {
  source: LeadSource;
  name: string;
  email: string;
  phone?: string | null;
  business?: string | null;
  best_time?: string | null;
  message?: string | null;
  service_category?: string | null;
  selected_service?: string | null;
  business_type?: string | null;
  page_path?: string | null;
}

export type SaveLeadResult = { ok: true; lead: Lead } | { ok: false; error: string };

function clean(value: string | null | undefined, max: number): string | null {
  return value?.trim().slice(0, max) || null;
}

export async function saveLead(input: SaveLeadInput): Promise<SaveLeadResult> {
  const now = new Date();

  const service_category = clean(input.service_category, 100);
  const selected_service = clean(input.selected_service, 150);
  const business_type = clean(input.business_type, 100);
  const phone = clean(input.phone, 60);
  const message = clean(input.message, 5000);

  const { priority, expectedValue, expectedValueCurrency } = scoreLead({
    source: input.source,
    service_category,
    selected_service,
    business_type,
    message,
    phone,
  });

  const insertRow = {
    name: input.name.trim().slice(0, 200),
    email: input.email.trim().slice(0, 320),
    phone,
    business: clean(input.business, 200),
    best_time: clean(input.best_time, 200),
    message,
    service_category,
    selected_service,
    business_type,
    source: input.source,
    page_path: clean(input.page_path, 300),
    status: "new" as const,
    priority,
    expected_value: expectedValue,
    expected_value_currency: expectedValueCurrency,
    next_follow_up_at: new Date(now.getTime() + FOLLOW_UP_DELAY_MS).toISOString(),
    follow_up_stage: 0,
    follow_up_completed: false,
  };

  const supabase = createServiceRoleClient();

  const { data: lead, error } = await supabase
    .from("leads")
    .insert(insertRow)
    .select()
    .single<Lead>();

  if (error || !lead) {
    console.error("[saveLead] insert failed:", error);
    return { ok: false, error: "Could not save your submission. Please try again." };
  }

  // Never let a notification failure change the outcome — the lead is already
  // saved, which is the part that matters.
  try {
    await sendLeadEmails(lead);
  } catch (err) {
    console.error("[saveLead] sendLeadEmails failed:", err);
  }

  await sendAdminPush({
    title: lead.source === "chatbot" ? "New lead (chatbot)" : "New lead",
    body: `${lead.name}${lead.business ? ` (${lead.business})` : ""}, ${
      lead.selected_service || lead.service_category || "general inquiry"
    }`,
    url: `/admin/leads/${lead.id}`,
  });

  return { ok: true, lead };
}

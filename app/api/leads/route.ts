import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { sendLeadEmails } from "@/lib/email/resend";
import type { Lead, LeadSource } from "@/lib/leads";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FOLLOW_UP_DELAY_MS = 24 * 60 * 60 * 1000; // Day 1

interface LeadPayload {
  source: LeadSource;
  page_path?: string;
  name: string;
  email: string;
  phone?: string;
  business?: string;
  best_time?: string;
  message?: string;
  service_category?: string;
  selected_service?: string;
  business_type?: string;
  /** Honeypot — real users never fill this in. */
  company_website?: string;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: NextRequest) {
  let payload: LeadPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  // Honeypot: pretend success so bots don't learn the field is being checked.
  if (isNonEmptyString(payload.company_website)) {
    return NextResponse.json({ ok: true });
  }

  if (!isNonEmptyString(payload.name) || !isNonEmptyString(payload.email)) {
    return NextResponse.json(
      { ok: false, error: "Name and email are required." },
      { status: 400 }
    );
  }

  if (!EMAIL_RE.test(payload.email.trim())) {
    return NextResponse.json({ ok: false, error: "Invalid email address." }, { status: 400 });
  }

  if (payload.source !== "contact_form" && payload.source !== "service_form") {
    return NextResponse.json({ ok: false, error: "Invalid source." }, { status: 400 });
  }

  const now = new Date();

  const insertRow = {
    name: payload.name.trim().slice(0, 200),
    email: payload.email.trim().slice(0, 320),
    phone: payload.phone?.trim().slice(0, 60) || null,
    business: payload.business?.trim().slice(0, 200) || null,
    best_time: payload.best_time?.trim().slice(0, 200) || null,
    message: payload.message?.trim().slice(0, 5000) || null,
    service_category: payload.service_category?.trim().slice(0, 100) || null,
    selected_service: payload.selected_service?.trim().slice(0, 150) || null,
    business_type: payload.business_type?.trim().slice(0, 100) || null,
    source: payload.source,
    page_path: payload.page_path?.trim().slice(0, 300) || null,
    status: "new" as const,
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
    console.error("[api/leads] insert failed:", error);
    return NextResponse.json(
      { ok: false, error: "Could not save your submission. Please try again." },
      { status: 500 }
    );
  }

  // Never let an email-sending failure change the response — the lead is
  // already saved, which is what matters to the user.
  try {
    await sendLeadEmails(lead);
  } catch (err) {
    console.error("[api/leads] sendLeadEmails failed:", err);
  }

  return NextResponse.json({ ok: true, id: lead.id });
}

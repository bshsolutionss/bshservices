import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { logActivity } from "@/lib/activity";
import { LEAD_PRIORITIES, LEAD_STATUSES, type LeadPriority, type LeadStatus } from "@/lib/leads";
import { CURRENCIES, type Currency } from "@/lib/invoices";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DAY_MS = 24 * 60 * 60 * 1000;

interface CreatePayload {
  name: string;
  email?: string;
  phone?: string;
  business?: string;
  website?: string;
  /** Where it came from, e.g. "Referral" or "WhatsApp". */
  source_detail?: string;
  service_category?: string;
  selected_service?: string;
  message?: string;
  notes?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  expected_value?: number | null;
  expected_value_currency?: Currency;
  /** Opt in to the automatic Day 1/3/7 follow-up emails (needs an email address). */
  auto_follow_up?: boolean;
}

/** Adds a lead by hand - a phone call, a WhatsApp chat, a referral - so everything lives in one pipeline. */
export async function POST(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  let payload: CreatePayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const name = payload.name?.trim();
  const email = payload.email?.trim() || null;
  const phone = payload.phone?.trim() || null;

  if (!name) return NextResponse.json({ ok: false, error: "A name is required." }, { status: 400 });
  if (!email && !phone) {
    return NextResponse.json({ ok: false, error: "Add an email or a phone number so you can reach them." }, { status: 400 });
  }
  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "That email address doesn't look right." }, { status: 400 });
  }
  if (payload.status && !LEAD_STATUSES.includes(payload.status)) {
    return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
  }
  if (payload.status === "lost") {
    return NextResponse.json({ ok: false, error: "Add the lead first, then mark it lost with a reason." }, { status: 400 });
  }
  if (payload.priority && !LEAD_PRIORITIES.includes(payload.priority)) {
    return NextResponse.json({ ok: false, error: "Invalid priority." }, { status: 400 });
  }
  if (payload.expected_value_currency && !(CURRENCIES as string[]).includes(payload.expected_value_currency)) {
    return NextResponse.json({ ok: false, error: "Invalid currency." }, { status: 400 });
  }
  const value = payload.expected_value == null ? null : Number(payload.expected_value);
  if (value !== null && (!Number.isFinite(value) || value < 0)) {
    return NextResponse.json({ ok: false, error: "Expected value can't be negative." }, { status: 400 });
  }

  const status: LeadStatus = payload.status || "new";
  // The nurture emails only make sense for someone who hasn't been spoken to and who has an inbox.
  const autoFollowUp = !!payload.auto_follow_up && !!email && (status === "new" || status === "contacted");
  const clean = (v: string | undefined, max: number) => v?.trim().slice(0, max) || null;

  const service = createServiceRoleClient();
  const { data, error } = await service
    .from("leads")
    .insert({
      name: name.slice(0, 200),
      email: email?.slice(0, 320) ?? null,
      phone: phone?.slice(0, 60) ?? null,
      business: clean(payload.business, 200),
      website: clean(payload.website, 300),
      lead_source_detail: clean(payload.source_detail, 100),
      service_category: clean(payload.service_category, 100),
      selected_service: clean(payload.selected_service, 150),
      message: clean(payload.message, 5000),
      notes: clean(payload.notes, 5000),
      source: "manual",
      status,
      priority: payload.priority || "medium",
      expected_value: value,
      expected_value_currency: payload.expected_value_currency || "PKR",
      next_follow_up_at: autoFollowUp ? new Date(Date.now() + DAY_MS).toISOString() : null,
      follow_up_stage: 0,
      follow_up_completed: !autoFollowUp,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[api/admin/leads] insert failed:", error);
    const missingColumn = error?.code === "PGRST204" || error?.code === "23502";
    return NextResponse.json(
      {
        ok: false,
        error: missingColumn
          ? "The database needs a one-time update: run supabase/migrations/0012_business_management.sql."
          : "Could not add the lead.",
      },
      { status: 500 }
    );
  }

  await logActivity({
    entityType: "lead",
    entityId: data.id,
    type: "lead_created",
    description: `Added manually${payload.source_detail ? ` (${payload.source_detail})` : ""}`,
  });

  return NextResponse.json({ ok: true, id: data.id });
}

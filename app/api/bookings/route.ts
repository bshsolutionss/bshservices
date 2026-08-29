import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { sendLeadEmails } from "@/lib/email/resend";
import { sendAdminPush } from "@/lib/push";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { isDateBookable } from "@/lib/availability";
import { scoreLead } from "@/lib/lead-scoring";
import type { Lead } from "@/lib/leads";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const FOLLOW_UP_DELAY_MS = 24 * 60 * 60 * 1000; // Day 1

interface BookingPayload {
  page_path?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  booking_date: string;
  booking_time: string;
  /** Carried over when the booking form was pre-filled from a service page or an earlier contact-form lead — see components/BookingForm.tsx. */
  service_category?: string;
  selected_service?: string;
  /** Honeypot — real users never fill this in. */
  company_website?: string;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: NextRequest) {
  // A bit more headroom than /api/leads — a "slot taken" 409 is a normal,
  // expected retry path here (pick another time), not just error-recovery.
  if (isRateLimited("bookings", getClientIp(request), 8, 10 * 60 * 1000)) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please try again in a few minutes." },
      { status: 429 }
    );
  }

  let payload: BookingPayload;

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
    return NextResponse.json({ ok: false, error: "Name and email are required." }, { status: 400 });
  }

  if (!EMAIL_RE.test(payload.email.trim())) {
    return NextResponse.json({ ok: false, error: "Invalid email address." }, { status: 400 });
  }

  if (!isDateBookable(payload.booking_date)) {
    return NextResponse.json({ ok: false, error: "Please choose a valid, upcoming date." }, { status: 400 });
  }

  if (!isNonEmptyString(payload.booking_time) || !TIME_RE.test(payload.booking_time)) {
    return NextResponse.json({ ok: false, error: "Please choose a time slot." }, { status: 400 });
  }

  const now = new Date();
  const phone = payload.phone?.trim().slice(0, 60) || null;
  const message = payload.message?.trim().slice(0, 5000) || null;
  // Only populated when the booking form was pre-filled — e.g. from a
  // service page's "Book a Consultation" link, or continuing from an
  // earlier contact-form submission. Picking an actual time slot is already
  // the strongest intent signal on the site either way (see SOURCE_POINTS),
  // so scoring still works fine when these are absent.
  const service_category = payload.service_category?.trim().slice(0, 100) || null;
  const selected_service = payload.selected_service?.trim().slice(0, 150) || null;

  const { priority, expectedValue, expectedValueCurrency } = scoreLead({
    source: "consultation_booking",
    service_category,
    selected_service,
    message,
    phone,
  });

  const insertRow = {
    name: payload.name.trim().slice(0, 200),
    email: payload.email.trim().slice(0, 320),
    phone,
    message,
    service_category,
    selected_service,
    source: "consultation_booking" as const,
    page_path: payload.page_path?.trim().slice(0, 300) || null,
    status: "new" as const,
    priority,
    expected_value: expectedValue,
    expected_value_currency: expectedValueCurrency,
    booking_date: payload.booking_date,
    booking_time: payload.booking_time,
    booking_status: "confirmed" as const,
    next_follow_up_at: new Date(now.getTime() + FOLLOW_UP_DELAY_MS).toISOString(),
    follow_up_stage: 0,
    follow_up_completed: false,
  };

  const supabase = createServiceRoleClient();

  const { data: lead, error } = await supabase.from("leads").insert(insertRow).select().single<Lead>();

  if (error) {
    // 23505 = Postgres unique-violation — the partial index on
    // (booking_date, booking_time) caught a race between two concurrent
    // submissions for the same slot. This is recoverable (pick another
    // slot), so it gets a distinct, actionable message rather than the
    // generic 500 below.
    if (error.code === "23505") {
      return NextResponse.json(
        { ok: false, error: "That time slot was just booked by someone else. Please pick another.", slotTaken: true },
        { status: 409 }
      );
    }

    console.error("[api/bookings] insert failed:", error);
    return NextResponse.json(
      { ok: false, error: "Could not save your booking. Please try again." },
      { status: 500 }
    );
  }

  if (!lead) {
    return NextResponse.json(
      { ok: false, error: "Could not save your booking. Please try again." },
      { status: 500 }
    );
  }

  // Never let an email-sending failure change the response — the booking is
  // already saved, which is what matters to the user.
  try {
    await sendLeadEmails(lead);
  } catch (err) {
    console.error("[api/bookings] sendLeadEmails failed:", err);
  }

  await sendAdminPush({
    title: "New consultation booked",
    body: `${lead.name} — ${lead.booking_date} at ${lead.booking_time}`,
    url: `/admin/bookings`,
  });

  return NextResponse.json({ ok: true, id: lead.id });
}

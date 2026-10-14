import { NextResponse, type NextRequest } from "next/server";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { saveLead } from "@/lib/leads-server";
import type { LeadSource } from "@/lib/leads";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  // 5 submissions per 10 minutes per IP — generous for a real visitor
  // (who submits once, maybe twice after fixing a validation error), tight
  // enough to blunt a scripted spam burst.
  if (isRateLimited("leads", getClientIp(request), 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { ok: false, error: "Too many submissions. Please try again in a few minutes." },
      { status: 429 }
    );
  }

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

  const VALID_SOURCES: LeadSource[] = ["contact_form", "service_form", "lead_magnet"];
  if (!VALID_SOURCES.includes(payload.source)) {
    return NextResponse.json({ ok: false, error: "Invalid source." }, { status: 400 });
  }

  const result = await saveLead({
    source: payload.source,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    business: payload.business,
    best_time: payload.best_time,
    message: payload.message,
    service_category: payload.service_category,
    selected_service: payload.selected_service,
    business_type: payload.business_type,
    page_path: payload.page_path,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: result.lead.id });
}

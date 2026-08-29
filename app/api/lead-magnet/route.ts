import { NextResponse, type NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { sendAdminPush } from "@/lib/push";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { scoreLead } from "@/lib/lead-scoring";
import { getLeadMagnet } from "@/lib/lead-magnets";
import { LeadMagnetDocument } from "@/lib/pdf/LeadMagnetDocument";
import { SITE_URL } from "@/lib/site";
import type { Lead } from "@/lib/leads";

// react-pdf needs Node APIs (fs, Buffer) — not compatible with the edge runtime.
export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LeadMagnetPayload {
  slug: string;
  name: string;
  email: string;
  page_path?: string;
  /** Honeypot — real users never fill this in. */
  company_website?: string;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: NextRequest) {
  if (isRateLimited("lead-magnet", getClientIp(request), 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again in a few minutes." },
      { status: 429 }
    );
  }

  let payload: LeadMagnetPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  // Honeypot: pretend success so bots don't learn the field is being checked
  // (a real 200-with-no-body would look broken to a human, but this route
  // response never renders as a "message" a legit user would see be wrong).
  if (isNonEmptyString(payload.company_website)) {
    return NextResponse.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 400 });
  }

  const magnet = getLeadMagnet(payload.slug);
  if (!magnet) {
    return NextResponse.json({ ok: false, error: "Unknown download." }, { status: 404 });
  }

  if (!isNonEmptyString(payload.name) || !isNonEmptyString(payload.email)) {
    return NextResponse.json({ ok: false, error: "Name and email are required." }, { status: 400 });
  }

  if (!EMAIL_RE.test(payload.email.trim())) {
    return NextResponse.json({ ok: false, error: "Invalid email address." }, { status: 400 });
  }

  const name = payload.name.trim().slice(0, 200);
  const email = payload.email.trim().slice(0, 320);

  const { priority, expectedValue, expectedValueCurrency } = scoreLead({
    source: "lead_magnet",
    selected_service: magnet.title,
  });

  const supabase = createServiceRoleClient();
  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      name,
      email,
      selected_service: magnet.title,
      source: "lead_magnet" as const,
      page_path: payload.page_path?.trim().slice(0, 300) || null,
      status: "new" as const,
      priority,
      expected_value: expectedValue,
      expected_value_currency: expectedValueCurrency,
      // Lead-magnet downloads don't enter the automated email follow-up
      // drip (that's for real inquiries) — a "we noticed you grabbed our
      // checklist" nurture email is a reasonable follow-up to build later,
      // not bundled in here.
      follow_up_stage: 0,
      follow_up_completed: true,
    })
    .select()
    .single<Lead>();

  if (error || !lead) {
    console.error("[api/lead-magnet] insert failed:", error);
    return NextResponse.json({ ok: false, error: "Could not process your request. Please try again." }, { status: 500 });
  }

  await sendAdminPush({
    title: "Lead magnet download",
    body: `${lead.name} downloaded "${magnet.title}"`,
    url: `/admin/leads/${lead.id}`,
  });

  const logoBuffer = await readFile(path.join(process.cwd(), "public", "android-chrome-192x192.png"));
  const siteHost = new URL(SITE_URL).host;
  const pdfBuffer = await renderToBuffer(LeadMagnetDocument({ magnet, logoBuffer, siteHost }));

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${magnet.slug}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}

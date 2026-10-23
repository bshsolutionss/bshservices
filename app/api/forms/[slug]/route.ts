import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { createInboundLead } from "@/lib/lead-intake";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";
import type { FormQuestion, LeadForm } from "@/lib/lead-forms";

/** Public: the shared form link posts here. No sign-in, so it is rate-limited and has a honeypot. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (isRateLimited("lead-form", getClientIp(request), 8, 10 * 60_000)) return NextResponse.json({ ok: false, error: "Too many submissions. Please try again in a few minutes." }, { status: 429 });

  const body = (await request.json().catch(() => null)) as { answers?: Record<string, string>; website_url?: string } | null;
  if (!body) return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  // Honeypot: real visitors never see this field. Pretend success so bots don't adapt.
  if (body.website_url) return NextResponse.json({ ok: true });

  const service = createServiceRoleClient();
  const { data: form } = await service.from("lead_forms").select("*").eq("slug", slug).eq("active", true).maybeSingle<LeadForm>();
  if (!form) return NextResponse.json({ ok: false, error: "This form is no longer accepting responses." }, { status: 404 });

  const answers = body.answers ?? {};
  const mapped: Partial<Record<FormQuestion["type"], string>> = {};
  const extra: Record<string, string> = {};
  let message = "";
  for (const q of form.questions) {
    const value = String(answers[q.id] ?? "").trim().slice(0, 2000);
    if (!value) {
      if (q.required) return NextResponse.json({ ok: false, error: `"${q.label}" is required.` }, { status: 400 });
      continue;
    }
    if (q.type === "text") {
      // The first free-text answer becomes the lead's message; any others are kept by their question.
      if (!message) message = value;
      else extra[q.label] = value;
    } else if (q.type === "budget") {
      extra[q.label] = value;
    } else if (!mapped[q.type]) {
      mapped[q.type] = value;
    }
  }

  const result = await createInboundLead({
    name: mapped.name ?? "",
    email: mapped.email,
    phone: mapped.phone,
    business: mapped.company,
    location: mapped.location,
    message,
    extra,
    source: "form",
    sourceDetail: `Form: ${form.name}`,
    formId: form.id,
    stageKey: form.stage_key,
  });
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

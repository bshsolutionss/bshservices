import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { createInboundLead } from "@/lib/lead-intake";
import { parseInbound, type LeadSourceRow } from "@/lib/lead-sources";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** CORS so a browser form on the client's own website can post here directly. */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

/** Reads JSON, form-encoded or multipart bodies into a flat object. */
async function readBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  const type = request.headers.get("content-type") ?? "";
  try {
    if (type.includes("application/json")) {
      const json = await request.json();
      return json && typeof json === "object" && !Array.isArray(json) ? (json as Record<string, unknown>) : null;
    }
    const form = await request.formData();
    const out: Record<string, unknown> = {};
    form.forEach((v, k) => {
      if (typeof v === "string") out[k] = v;
    });
    return out;
  } catch {
    return null;
  }
}

/**
 * Public inbound endpoint for a connected lead source. The unguessable token in
 * the URL is the credential; it is looked up server-side and switching the
 * source off in Lead sources stops it immediately.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const ip = getClientIp(request);
  // Per-token bucket is generous (ad platforms burst); the per-IP one stops a single abuser guessing tokens.
  if (isRateLimited("lead-source-ip", ip, 120, 10 * 60_000)) {
    return NextResponse.json({ ok: false, error: "Too many requests." }, { status: 429, headers: CORS });
  }

  const service = createServiceRoleClient();
  const { data: source } = await service.from("lead_sources").select("*").eq("token", token).eq("active", true).maybeSingle<LeadSourceRow>();
  if (!source) return NextResponse.json({ ok: false, error: "Unknown or paused source." }, { status: 404, headers: CORS });

  const body = await readBody(request);
  if (!body) return NextResponse.json({ ok: false, error: "Send JSON or form data." }, { status: 400, headers: CORS });
  // Honeypot for the website-form snippet.
  if (body.website_url) return NextResponse.json({ ok: true }, { headers: CORS });

  const parsed = parseInbound(source.type, body);
  const result = await createInboundLead({
    ...parsed,
    source: "webhook",
    sourceDetail: source.name,
    sourceId: source.id,
    stageKey: source.stage_key,
  });
  if (!result.ok) {
    return NextResponse.json(source.type === "indiamart" ? { CODE: 400, STATUS: result.error } : { ok: false, error: result.error }, { status: 400, headers: CORS });
  }

  await service.from("lead_sources").update({ last_lead_at: new Date().toISOString() }).eq("id", source.id);
  // IndiaMART's push API expects this exact acknowledgement.
  return NextResponse.json(source.type === "indiamart" ? { CODE: 200, STATUS: "SUCCESS" } : { ok: true, duplicate: result.duplicate }, { headers: CORS });
}

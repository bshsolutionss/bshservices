import { NextResponse, type NextRequest } from "next/server";
import { requirePortalUser } from "@/lib/portal/session";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { logActivity } from "@/lib/activity";
import { sendAdminPush } from "@/lib/push";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DAY_MS = 86_400_000;

interface Payload {
  name?: string;
  phone?: string;
  email?: string;
  note?: string;
  consent?: boolean;
}

/** A client introduces someone: stored as a referral and dropped straight into Leads. */
export async function POST(request: NextRequest) {
  const auth = await requirePortalUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { session } = auth;

  const payload = (await request.json().catch(() => null)) as Payload | null;
  const name = (payload?.name ?? "").trim().slice(0, 200);
  const phone = (payload?.phone ?? "").trim().slice(0, 60);
  const email = (payload?.email ?? "").trim().toLowerCase().slice(0, 320);
  const note = (payload?.note ?? "").trim().slice(0, 2000);

  if (!name || !phone) return NextResponse.json({ ok: false, error: "Their name and phone number are required." }, { status: 400 });
  if (email && !EMAIL_RE.test(email)) return NextResponse.json({ ok: false, error: "That email address doesn't look right." }, { status: 400 });
  // We are receiving a third party's personal data, so the client must confirm they have permission.
  if (payload?.consent !== true) {
    return NextResponse.json({ ok: false, error: "Please confirm you have this person's permission to share their details." }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { data: lead, error: leadError } = await service
    .from("leads")
    .insert({
      name,
      email: email || null,
      phone,
      message: note || null,
      source: "manual",
      lead_source_detail: `Referral - ${session.clientName}`,
      status: "new",
      priority: "medium",
      expected_value_currency: "PKR",
      next_follow_up_at: new Date(Date.now() + DAY_MS).toISOString(),
      follow_up_stage: 0,
      follow_up_completed: false,
    })
    .select("id")
    .single();
  if (leadError || !lead) {
    console.error("[api/portal/referrals] lead insert failed:", leadError);
    return NextResponse.json({ ok: false, error: "Could not send the referral. Please try again." }, { status: 500 });
  }

  await service.from("referrals").insert({
    client_id: session.clientId,
    referred_name: name,
    referred_phone: phone,
    referred_email: email || null,
    note: note || null,
    consent_confirmed: true,
    consent_at: new Date().toISOString(),
    lead_id: lead.id,
  });
  await logActivity({ entityType: "lead", entityId: lead.id, type: "lead_created", description: `Referred by ${session.clientName} (${session.name}) through the client portal` });
  await logActivity({ entityType: "client", entityId: session.clientId, type: "portal_referral", description: `${session.name} referred ${name}.` });
  await sendAdminPush({ title: `New referral from ${session.clientName}`, body: `${name} - ${phone}`, url: `/admin/leads/${lead.id}` }).catch(() => {});
  return NextResponse.json({ ok: true });
}

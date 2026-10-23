import { NextResponse, type NextRequest } from "next/server";
import { requirePortalUser } from "@/lib/portal/session";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { logActivity } from "@/lib/activity";
import { sendAdminPush } from "@/lib/push";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePortalUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { session } = auth;
  const { id } = await params;

  const payload = (await request.json().catch(() => null)) as { decision?: string; comment?: string } | null;
  if (payload?.decision !== "approved" && payload?.decision !== "changes_requested") {
    return NextResponse.json({ ok: false, error: "Choose approve or request changes." }, { status: 400 });
  }
  const comment = (payload.comment ?? "").trim().slice(0, 2000);
  if (payload.decision === "changes_requested" && !comment) {
    return NextResponse.json({ ok: false, error: "Tell us what you'd like changed." }, { status: 400 });
  }

  const service = createServiceRoleClient();
  // The .eq filters make this a no-op for another client's approval or one already answered.
  const { data, error } = await service
    .from("approvals")
    .update({
      status: payload.decision,
      client_comment: comment || null,
      responded_at: new Date().toISOString(),
      responded_by: session.name,
    })
    .eq("id", id)
    .eq("client_id", session.clientId)
    .eq("status", "pending")
    .select("title")
    .maybeSingle();
  if (error) {
    console.error("[api/portal/approvals] failed:", error);
    return NextResponse.json({ ok: false, error: "Could not save your answer." }, { status: 500 });
  }
  if (!data) return NextResponse.json({ ok: false, error: "This request was already answered." }, { status: 409 });

  const verb = payload.decision === "approved" ? "approved" : "asked for changes on";
  await logActivity({ entityType: "client", entityId: session.clientId, type: "portal_approval", description: `${session.name} ${verb} "${data.title}"${comment ? `: ${comment}` : ""}` });
  await sendAdminPush({ title: `${session.clientName} ${verb} "${data.title}"`, body: comment || "Open the client to see details.", url: `/admin/clients/${session.clientId}` }).catch(() => {});
  return NextResponse.json({ ok: true });
}

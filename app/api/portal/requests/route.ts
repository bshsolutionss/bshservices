import { NextResponse, type NextRequest } from "next/server";
import { requirePortalUser } from "@/lib/portal/session";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { logActivity } from "@/lib/activity";
import { sendAdminPush } from "@/lib/push";

export async function POST(request: NextRequest) {
  const auth = await requirePortalUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { session } = auth;

  const payload = (await request.json().catch(() => null)) as { title?: string; details?: string; projectId?: string | null } | null;
  const title = (payload?.title ?? "").trim().slice(0, 200);
  if (!title) return NextResponse.json({ ok: false, error: "Tell us what you'd like to change or add." }, { status: 400 });

  const service = createServiceRoleClient();
  let projectId: string | null = null;
  if (payload?.projectId) {
    const { data: project } = await service.from("projects").select("id").eq("id", payload.projectId).eq("client_id", session.clientId).maybeSingle();
    if (!project) return NextResponse.json({ ok: false, error: "Project not found." }, { status: 404 });
    projectId = project.id;
  }

  const { error } = await service.from("change_requests").insert({
    client_id: session.clientId,
    project_id: projectId,
    title,
    details: (payload?.details ?? "").trim().slice(0, 4000) || null,
    requested_by: session.name,
  });
  if (error) {
    console.error("[api/portal/requests] failed:", error);
    return NextResponse.json({ ok: false, error: "Could not send your request." }, { status: 500 });
  }

  await logActivity({ entityType: "client", entityId: session.clientId, type: "portal_request", description: `${session.name} requested a change: ${title}` });
  await sendAdminPush({ title: `Change request from ${session.clientName}`, body: title, url: "/admin/portal" }).catch(() => {});
  return NextResponse.json({ ok: true });
}

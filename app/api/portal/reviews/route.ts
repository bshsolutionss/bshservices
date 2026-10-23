import { NextResponse, type NextRequest } from "next/server";
import { requirePortalUser } from "@/lib/portal/session";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { logActivity } from "@/lib/activity";
import { sendAdminPush } from "@/lib/push";

interface Payload {
  projectId?: string | null;
  rating?: number | null;
  body?: string;
  displayName?: string;
}

/** A project review (one per project, editable) or a general testimonial (no projectId). */
export async function POST(request: NextRequest) {
  const auth = await requirePortalUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { session } = auth;

  const payload = (await request.json().catch(() => null)) as Payload | null;
  if (!payload) return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });

  const rating = payload.rating == null ? null : Math.round(Number(payload.rating));
  if (rating !== null && (rating < 1 || rating > 5)) {
    return NextResponse.json({ ok: false, error: "Rating must be 1 to 5 stars." }, { status: 400 });
  }
  const body = (payload.body ?? "").trim().slice(0, 2000);
  if (rating === null && !body) return NextResponse.json({ ok: false, error: "Add a rating or a few words." }, { status: 400 });
  const displayName = (payload.displayName ?? "").trim().slice(0, 120) || session.name;

  const service = createServiceRoleClient();
  const projectId = payload.projectId || null;
  if (projectId) {
    const { data: project } = await service.from("projects").select("id").eq("id", projectId).eq("client_id", session.clientId).maybeSingle();
    if (!project) return NextResponse.json({ ok: false, error: "Project not found." }, { status: 404 });
  }

  const row = { client_id: session.clientId, project_id: projectId, kind: projectId ? "project" : "testimonial", rating, body: body || null, display_name: displayName };
  let error;
  if (projectId) {
    const { data: existing } = await service.from("reviews").select("id").eq("client_id", session.clientId).eq("project_id", projectId).eq("kind", "project").maybeSingle();
    ({ error } = existing ? await service.from("reviews").update(row).eq("id", existing.id) : await service.from("reviews").insert(row));
  } else {
    ({ error } = await service.from("reviews").insert(row));
  }
  if (error) {
    console.error("[api/portal/reviews] failed:", error);
    return NextResponse.json({ ok: false, error: "Could not save your review." }, { status: 500 });
  }

  await logActivity({ entityType: "client", entityId: session.clientId, type: "portal_review", description: `${displayName} left ${rating ? `a ${rating}-star ` : "a "}${projectId ? "project review" : "testimonial"}.` });
  await sendAdminPush({ title: `New ${projectId ? "review" : "testimonial"} from ${session.clientName}`, body: rating ? `${rating} stars` : body.slice(0, 80), url: "/admin/portal" }).catch(() => {});
  return NextResponse.json({ ok: true });
}

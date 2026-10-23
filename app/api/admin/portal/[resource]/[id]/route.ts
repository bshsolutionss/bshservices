import { NextResponse, type NextRequest } from "next/server";
import { after } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { notifyClient } from "@/lib/portal/session";
import { cleanText, cleanUrl, isUuid } from "@/lib/portal/admin-input";

const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

const TABLES: Record<string, string> = {
  approvals: "approvals",
  meetings: "meetings",
  documents: "documents",
  updates: "project_updates",
  requests: "change_requests",
  reviews: "reviews",
};

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ resource: string; id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { resource, id } = await params;
  const table = TABLES[resource];
  if (!table || !isUuid(id)) return fail("Not found.", 404);

  const p = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!p) return fail("Invalid request.");
  const service = createServiceRoleClient();

  if (resource === "requests" && p.action === "to_task") {
    const { data: req } = await service.from("change_requests").select("id, client_id, project_id, title, details, task_id").eq("id", id).maybeSingle();
    if (!req) return fail("Request not found.", 404);
    if (req.task_id) return fail("This request already has a task.", 409);
    const projectId = isUuid(p.projectId) ? p.projectId : req.project_id;
    if (!projectId) return fail("Choose which project this task belongs to.");
    const { data: project } = await service.from("projects").select("id").eq("id", projectId).eq("client_id", req.client_id).maybeSingle();
    if (!project) return fail("That project doesn't belong to this client.");
    const { data: task, error } = await service
      .from("tasks")
      .insert({ project_id: project.id, title: req.title, description: req.details, status: "todo", priority: "medium", client_visible: true })
      .select("id")
      .single();
    if (error || !task) return fail("Could not create the task.", 500);
    await service.from("change_requests").update({ task_id: task.id, project_id: project.id, status: "in_progress" }).eq("id", id);
    after(() => notifyClient(req.client_id, "We're working on your request", req.title, "/portal/requests"));
    return NextResponse.json({ ok: true, taskId: task.id });
  }

  const updates: Record<string, unknown> = {};
  if (resource === "requests") {
    if (!["open", "in_progress", "done", "declined"].includes(String(p.status))) return fail("Choose a valid status.");
    updates.status = p.status;
  } else if (resource === "reviews") {
    if (typeof p.approved !== "boolean") return fail("Invalid request.");
    updates.approved = p.approved;
  } else if (resource === "meetings") {
    if (p.status !== undefined) {
      if (!["scheduled", "held", "cancelled"].includes(String(p.status))) return fail("Choose a valid status.");
      updates.status = p.status;
    }
    if (p.notes !== undefined) updates.notes = cleanText(p.notes, 8000);
    if (p.recordingUrl !== undefined) updates.recording_url = cleanUrl(p.recordingUrl);
    if (p.linkUrl !== undefined) updates.link_url = cleanUrl(p.linkUrl);
  } else if (resource === "updates") {
    if (typeof p.internal !== "boolean") return fail("Invalid request.");
    updates.internal = p.internal;
  } else if (resource === "documents") {
    if (typeof p.shared === "boolean") updates.shared = p.shared;
    if (p.title !== undefined) {
      const title = cleanText(p.title, 200);
      if (!title) return fail("Add a title.");
      updates.title = title;
    }
  } else {
    return fail("Nothing to update here.", 400);
  }
  if (Object.keys(updates).length === 0) return fail("Nothing to update.");

  const { error } = await service.from(table).update(updates).eq("id", id);
  return error ? fail("Could not save.", 500) : NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ resource: string; id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { resource, id } = await params;
  const table = TABLES[resource];
  if (!table || !isUuid(id)) return fail("Not found.", 404);
  const service = createServiceRoleClient();

  if (resource === "documents") {
    const { data: doc } = await service.from("documents").select("storage_path").eq("id", id).maybeSingle();
    if (doc?.storage_path) await service.storage.from("portal-files").remove([doc.storage_path]);
  }
  const { error } = await service.from(table).delete().eq("id", id);
  return error ? fail("Could not delete.", 500) : NextResponse.json({ ok: true });
}

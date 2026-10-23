import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { after } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { notifyClient } from "@/lib/portal/session";
import { notifyClientEverywhere } from "@/lib/portal/notify";
import { MAX_UPLOAD_BYTES } from "@/lib/portal/chat";
import { cleanText, cleanUrl, isUuid } from "@/lib/portal/admin-input";

const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

/** Creates the things a client sees in their portal: approvals, meetings, documents, progress updates, visibility flags. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { resource } = await params;
  const service = createServiceRoleClient();

  if (resource === "documents") return createDocument(request, service);

  const p = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!p) return fail("Invalid request.");

  if (resource === "visibility") {
    // Shows or hides one project / task in the client's portal.
    const table = p.kind === "project" ? "projects" : p.kind === "task" ? "tasks" : null;
    const column = p.kind === "project" ? "portal_visible" : "client_visible";
    if (!table || !isUuid(p.id) || typeof p.visible !== "boolean") return fail("Invalid request.");
    const { error } = await service.from(table).update({ [column]: p.visible }).eq("id", p.id);
    return error ? fail("Could not save.", 500) : NextResponse.json({ ok: true });
  }

  if (resource === "updates") {
    const title = cleanText(p.title, 200);
    if (!isUuid(p.projectId) || !title) return fail("Choose a project and add a title.");
    const { data: project } = await service.from("projects").select("id, client_id, name").eq("id", p.projectId).maybeSingle();
    if (!project) return fail("Project not found.", 404);
    const { error } = await service.from("project_updates").insert({ project_id: project.id, title, body: cleanText(p.body, 4000) });
    if (error) return fail("Could not save. Run supabase/migrations/0015_client_portal.sql first.", 500);
    after(() => notifyClient(project.client_id, `Update on ${project.name}`, title, `/portal/projects/${project.id}`));
    return NextResponse.json({ ok: true });
  }

  if (!isUuid(p.clientId)) return fail("Choose a client.");
  const { data: client } = await service.from("clients").select("id").eq("id", p.clientId).maybeSingle();
  if (!client) return fail("Client not found.", 404);
  const projectId = isUuid(p.projectId) ? p.projectId : null;
  const title = cleanText(p.title, 200);
  if (!title) return fail("Add a title.");

  if (resource === "approvals") {
    const { error } = await service.from("approvals").insert({
      client_id: client.id,
      project_id: projectId,
      title,
      description: cleanText(p.description, 4000),
      link_url: cleanUrl(p.linkUrl),
    });
    if (error) return fail("Could not save. Run supabase/migrations/0015_client_portal.sql first.", 500);
    after(() => notifyClientEverywhere({ clientId: client.id, title: `Approval needed: ${title}`, body: "We've shared something for your sign-off.", path: "/portal/requests", kind: "portal_approval" }));
    return NextResponse.json({ ok: true });
  }

  if (resource === "meetings") {
    const startsAt = new Date(String(p.startsAt ?? ""));
    if (Number.isNaN(startsAt.getTime())) return fail("Choose a date and time.");
    const duration = Math.min(480, Math.max(5, Math.round(Number(p.durationMinutes) || 30)));
    const { error } = await service.from("meetings").insert({
      client_id: client.id,
      project_id: projectId,
      title,
      starts_at: startsAt.toISOString(),
      duration_minutes: duration,
      link_url: cleanUrl(p.linkUrl),
      agenda: cleanText(p.agenda, 4000),
    });
    if (error) return fail("Could not save. Run supabase/migrations/0015_client_portal.sql first.", 500);
    after(() =>
      notifyClientEverywhere({
        clientId: client.id,
        title: `Meeting scheduled: ${title}`,
        body: startsAt.toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" }),
        path: "/portal/meetings",
        kind: "portal_meeting",
      })
    );
    return NextResponse.json({ ok: true });
  }

  return fail("Unknown resource.", 404);
}

async function createDocument(request: NextRequest, service: ReturnType<typeof createServiceRoleClient>) {
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const clientId = String(form?.get("clientId") ?? "");
  const title = cleanText(form?.get("title"), 200);
  if (!form || !(file instanceof File) || file.size === 0) return fail("Choose a file to upload.");
  if (!isUuid(clientId)) return fail("Choose a client.");
  if (file.size > MAX_UPLOAD_BYTES * 2) return fail("Files can be up to 20 MB.");

  const { data: client } = await service.from("clients").select("id").eq("id", clientId).maybeSingle();
  if (!client) return fail("Client not found.", 404);
  const rawProject = String(form.get("projectId") ?? "");
  const projectId = isUuid(rawProject) ? rawProject : null;

  const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-80) || "file";
  const path = `documents/${client.id}/${randomUUID()}-${safe}`;
  const { error: uploadError } = await service.storage.from("portal-files").upload(path, Buffer.from(await file.arrayBuffer()), {
    contentType: file.type || "application/octet-stream",
  });
  if (uploadError) {
    console.error("[api/admin/portal] upload failed:", uploadError);
    return fail("Could not upload the file. Check the portal-files storage bucket exists (migration 0015).", 500);
  }

  const shared = String(form.get("shared") ?? "true") !== "false";
  const docTitle = title ?? file.name;
  const { error } = await service.from("documents").insert({
    client_id: client.id,
    project_id: projectId,
    title: docTitle,
    category: cleanText(form.get("category"), 40)?.toLowerCase() ?? "other",
    storage_path: path,
    file_name: file.name.slice(0, 200),
    mime_type: file.type || null,
    size_bytes: file.size,
    uploaded_by: "admin",
    shared,
  });
  if (error) {
    await service.storage.from("portal-files").remove([path]);
    return fail("Could not save the document.", 500);
  }
  if (shared) {
    after(() => notifyClientEverywhere({ clientId: client.id, title: `New document: ${docTitle}`, body: "We've shared a file with you.", path: "/portal/documents", kind: "portal_document" }));
  }
  return NextResponse.json({ ok: true });
}

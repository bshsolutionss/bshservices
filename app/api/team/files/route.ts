import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { after } from "next/server";
import { requireTeamUser } from "@/lib/team/session";
import { canSeeProject } from "@/lib/team/data";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { notifyClientEverywhere } from "@/lib/portal/notify";
import { sendAdminPush } from "@/lib/push";
import { cleanText, isUuid } from "@/lib/portal/admin-input";

const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });
const MAX_BYTES = 20 * 1024 * 1024;

/** Uploads a file onto a project. Only members with "share" access can publish it to the client. */
export async function POST(request: NextRequest) {
  const auth = await requireTeamUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { session } = auth;
  if (session.access.files !== "upload" && session.access.files !== "share") return fail("You don't have access to upload files.", 403);

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const projectId = String(form?.get("projectId") ?? "");
  if (!form || !(file instanceof File) || file.size === 0) return fail("Choose a file to upload.");
  if (file.size > MAX_BYTES) return fail("Files can be up to 20 MB.");
  if (!isUuid(projectId) || !(await canSeeProject(session, projectId))) return fail("You can only upload to projects you can see.", 403);

  const service = createServiceRoleClient();
  const { data: project } = await service.from("projects").select("id, client_id, name").eq("id", projectId).maybeSingle();
  if (!project) return fail("Project not found.", 404);

  const share = session.access.files === "share" && String(form.get("share")) === "true";
  const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-80) || "file";
  const path = `documents/${project.client_id}/${randomUUID()}-${safe}`;
  const { error: uploadError } = await service.storage.from("portal-files").upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type || "application/octet-stream" });
  if (uploadError) {
    console.error("[api/team/files] upload failed:", uploadError);
    return fail("Could not upload the file.", 500);
  }

  const title = cleanText(form.get("title"), 200) ?? file.name;
  const { error } = await service.from("documents").insert({
    client_id: project.client_id,
    project_id: project.id,
    title,
    category: "deliverable",
    storage_path: path,
    file_name: file.name.slice(0, 200),
    mime_type: file.type || null,
    size_bytes: file.size,
    uploaded_by: "admin",
    shared: share,
  });
  if (error) {
    await service.storage.from("portal-files").remove([path]);
    return fail("Could not save the file.", 500);
  }

  if (share) {
    after(() => notifyClientEverywhere({ clientId: project.client_id, title: `New file: ${title}`, body: `A file was added to ${project.name}.`, path: `/portal/projects/${project.id}?tab=files`, kind: "portal_document" }));
  } else {
    await sendAdminPush({ title: `${session.name} uploaded a file`, body: `${project.name}: ${title}`, url: `/admin/clients/${project.client_id}` }).catch(() => {});
  }
  return NextResponse.json({ ok: true, shared: share });
}

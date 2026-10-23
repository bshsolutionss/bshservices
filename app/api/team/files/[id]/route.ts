import { NextResponse, type NextRequest } from "next/server";
import { requireTeamUser } from "@/lib/team/session";
import { canSeeProject } from "@/lib/team/data";
import { createServiceRoleClient } from "@/lib/supabase/service";

/** Opens a project file for a team member who has file access and can see that project. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireTeamUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { session } = auth;
  const { id } = await params;
  const notFound = NextResponse.json({ ok: false, error: "File not found." }, { status: 404 });
  if (session.access.files === "none") return notFound;

  const service = createServiceRoleClient();
  const { data: doc } = await service.from("documents").select("storage_path, file_name, project_id").eq("id", id).maybeSingle();
  if (!doc?.project_id || !(await canSeeProject(session, doc.project_id))) return notFound;
  const { data, error } = await service.storage.from("portal-files").createSignedUrl(doc.storage_path, 60, { download: doc.file_name });
  if (error || !data) return NextResponse.json({ ok: false, error: "Could not open the file." }, { status: 500 });
  return NextResponse.redirect(data.signedUrl);
}

import { NextResponse, type NextRequest } from "next/server";
import { requireTeamUser } from "@/lib/team/session";
import { canSeeProject } from "@/lib/team/data";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { notifyClient } from "@/lib/portal/session";
import { sendAdminPush } from "@/lib/push";
import { cleanText, isUuid } from "@/lib/portal/admin-input";

const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

/** A progress update on a project. "Internal only" members' updates stay hidden from the client until an admin publishes them. */
export async function POST(request: NextRequest) {
  const auth = await requireTeamUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { session } = auth;
  if (session.access.progress === "none") return fail("You don't have access to post progress updates.", 403);

  const p = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const title = cleanText(p?.title, 200);
  if (!isUuid(p?.projectId) || !title) return fail("Choose a project and add a short headline.");
  if (!(await canSeeProject(session, String(p?.projectId)))) return fail("You can only post on projects you can see.", 403);

  const internal = session.access.progress === "internal";
  const service = createServiceRoleClient();
  const { data: project } = await service.from("projects").select("id, name, client_id").eq("id", p?.projectId as string).maybeSingle();
  if (!project) return fail("Project not found.", 404);

  const { error } = await service.from("project_updates").insert({ project_id: project.id, title, body: cleanText(p?.body, 4000), internal, author_name: session.name });
  if (error) {
    console.error("[api/team/progress] failed:", error);
    return fail("Could not post the update. Run supabase/migrations/0018_team_access.sql first.", 500);
  }

  if (internal) {
    await sendAdminPush({ title: `Update from ${session.name} needs publishing`, body: `${project.name}: ${title}`, url: `/admin/clients/${project.client_id}` }).catch(() => {});
  } else {
    await notifyClient(project.client_id, `Update on ${project.name}`, title, `/portal/projects/${project.id}`);
  }
  return NextResponse.json({ ok: true, internal });
}

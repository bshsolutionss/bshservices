import { NextResponse, type NextRequest } from "next/server";
import { after } from "next/server";
import { requireTeamUser } from "@/lib/team/session";
import { canSeeProject } from "@/lib/team/data";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { notifyClientEverywhere } from "@/lib/portal/notify";
import { cleanText, cleanUrl, isUuid } from "@/lib/portal/admin-input";

const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

/** Schedules a meeting with the client of a project the member can see; the client is notified. */
export async function POST(request: NextRequest) {
  const auth = await requireTeamUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { session } = auth;
  if (session.access.meetings !== "create") return fail("You don't have access to schedule meetings.", 403);

  const p = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const title = cleanText(p?.title, 200);
  const startsAt = new Date(String(p?.startsAt ?? ""));
  if (!isUuid(p?.projectId) || !title) return fail("Choose a project and give the meeting a title.");
  if (Number.isNaN(startsAt.getTime())) return fail("Choose a date and time.");
  if (!(await canSeeProject(session, String(p?.projectId)))) return fail("You can only schedule meetings on projects you can see.", 403);

  const service = createServiceRoleClient();
  const { data: project } = await service.from("projects").select("id, client_id").eq("id", p?.projectId as string).maybeSingle();
  if (!project) return fail("Project not found.", 404);

  const { error } = await service.from("meetings").insert({
    client_id: project.client_id,
    project_id: project.id,
    title,
    starts_at: startsAt.toISOString(),
    duration_minutes: Math.min(480, Math.max(5, Math.round(Number(p?.durationMinutes) || 30))),
    link_url: cleanUrl(p?.linkUrl),
    agenda: cleanText(p?.agenda, 4000),
  });
  if (error) return fail("Could not schedule the meeting.", 500);

  after(() => notifyClientEverywhere({ clientId: project.client_id, title: `Meeting scheduled: ${title}`, body: startsAt.toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" }), path: "/portal/meetings", kind: "portal_meeting" }));
  return NextResponse.json({ ok: true });
}

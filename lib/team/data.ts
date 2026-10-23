import { createServiceRoleClient } from "@/lib/supabase/service";
import type { Project } from "@/lib/projects";
import type { TeamSession } from "@/lib/team/session";

/** The projects this team member may see: their assigned ones, or every active client project when granted. */
export async function getTeamProjects(session: TeamSession): Promise<Project[]> {
  const service = createServiceRoleClient();
  if (session.access.visibility === "all") {
    const { data } = await service.from("projects").select("*").eq("archived", false).order("created_at", { ascending: false });
    return (data ?? []) as Project[];
  }
  const { data: members } = await service.from("project_members").select("project_id").eq("employee_id", session.employeeId);
  const ids = (members ?? []).map((m) => m.project_id as string);
  if (ids.length === 0) return [];
  const { data } = await service.from("projects").select("*").in("id", ids).eq("archived", false).order("created_at", { ascending: false });
  return (data ?? []) as Project[];
}

/** True when the project is one this person may see (used by every /api/team write). */
export async function canSeeProject(session: TeamSession, projectId: string): Promise<boolean> {
  const service = createServiceRoleClient();
  const { data: project } = await service.from("projects").select("id, archived").eq("id", projectId).maybeSingle();
  if (!project || project.archived) return false;
  if (session.access.visibility === "all") return true;
  const { data } = await service.from("project_members").select("project_id").eq("project_id", projectId).eq("employee_id", session.employeeId).maybeSingle();
  return !!data;
}

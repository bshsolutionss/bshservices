import { createServiceRoleClient } from "@/lib/supabase/service";
import { SITE_URL } from "@/lib/site";
import { getPortalWelcome } from "@/lib/portal/welcome";
import type { ApprovalRow, DocumentRow, MeetingRow, UpdateRow, VisibilityProject } from "@/components/admin/portal/PortalManager";

/** Everything the admin client page needs about this client's portal, in one parallel load. */
export async function loadClientPortalData(clientId: string) {
  const service = createServiceRoleClient();

  const [projectsRes, userRes, approvals, meetings, documents, welcome] = await Promise.all([
    service.from("projects").select("id, name, portal_visible").eq("client_id", clientId).order("created_at", { ascending: false }),
    service.from("client_users").select("auth_user_id, email, name, active, onboarding").eq("client_id", clientId).limit(1).maybeSingle(),
    service.from("approvals").select("id, title, status, client_comment, created_at").eq("client_id", clientId).order("created_at", { ascending: false }).limit(20),
    service.from("meetings").select("id, title, starts_at, duration_minutes, status, notes, recording_url, link_url").eq("client_id", clientId).order("starts_at", { ascending: false }).limit(20),
    service.from("documents").select("id, title, category, file_name, shared, created_at").eq("client_id", clientId).order("created_at", { ascending: false }).limit(30),
    getPortalWelcome(),
  ]);

  const projects = (projectsRes.data ?? []) as { id: string; name: string; portal_visible: boolean }[];
  const projectIds = projects.map((p) => p.id);
  const [tasksRes, updatesRes] = projectIds.length
    ? await Promise.all([
        service.from("tasks").select("id, project_id, title, client_visible").in("project_id", projectIds).neq("status", "completed").order("created_at").limit(200),
        service.from("project_updates").select("id, project_id, title, created_at, internal, author_name").in("project_id", projectIds).order("created_at", { ascending: false }).limit(10),
      ])
    : [{ data: [] }, { data: [] }];

  const tasks = (tasksRes.data ?? []) as { id: string; project_id: string; title: string; client_visible: boolean }[];
  const nameOf = new Map(projects.map((p) => [p.id, p.name]));

  let lastSignIn: string | null = null;
  if (userRes.data) {
    try {
      const { data } = await service.auth.admin.getUserById(userRes.data.auth_user_id);
      lastSignIn = data.user?.last_sign_in_at ?? null;
    } catch {
      // Not critical - the card just shows "Never".
    }
  }

  const checked = ((userRes.data?.onboarding as { checked?: string[] } | null)?.checked ?? []).filter((c) => welcome.checklist.some((i) => i.id === c));

  return {
    portalUrl: `${SITE_URL}/portal`,
    projects: projects.map((p) => ({ id: p.id, name: p.name })),
    user: userRes.data
      ? {
          email: userRes.data.email as string,
          name: (userRes.data.name as string | null) ?? null,
          active: userRes.data.active as boolean,
          lastSignIn,
          checklistDone: checked.length,
          checklistTotal: welcome.checklist.length,
        }
      : null,
    approvals: (approvals.data ?? []) as ApprovalRow[],
    meetings: (meetings.data ?? []) as MeetingRow[],
    documents: (documents.data ?? []) as DocumentRow[],
    updates: ((updatesRes.data ?? []) as { id: string; project_id: string; title: string; created_at: string; internal: boolean | null; author_name: string | null }[]).map(
      (u): UpdateRow => ({ id: u.id, title: u.title, created_at: u.created_at, project_name: nameOf.get(u.project_id) ?? "Project", internal: !!u.internal, author_name: u.author_name })
    ),
    visibility: projects.map(
      (p): VisibilityProject => ({ ...p, tasks: tasks.filter((t) => t.project_id === p.id).map(({ id, title, client_visible }) => ({ id, title, client_visible })) })
    ),
  };
}

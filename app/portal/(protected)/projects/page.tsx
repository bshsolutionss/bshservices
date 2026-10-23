import Link from "next/link";
import { ChevronRight, FolderKanban } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getPortalSession } from "@/lib/portal/session";
import { getVisibleProjects, projectProgress } from "@/lib/portal/data";
import { PORTAL_STAGE } from "@/lib/portal/status";
import { EmptyState, PageHeader, ProgressBar, StatusPill, portalCard } from "@/components/portal/ui";
import { formatDate } from "@/lib/invoices";
import type { ProjectStage } from "@/lib/projects";

export default async function PortalProjectsPage() {
  const session = (await getPortalSession())!;
  const projects = await getVisibleProjects(session.clientId);
  const ids = projects.map((p) => p.id);
  const { data: tasks } = ids.length
    ? await createServiceRoleClient().from("tasks").select("project_id, status").in("project_id", ids).eq("client_visible", true)
    : { data: [] as { project_id: string; status: string }[] };

  return (
    <div>
      <PageHeader icon={FolderKanban} title="Projects" subtitle="Follow progress on everything we're building." />
      {projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects yet" description="Your projects and their progress will appear here." />
      ) : (
        <div className="space-y-3">
          {projects.map((p) => {
            const stage = PORTAL_STAGE[p.stage as ProjectStage];
            const progress = projectProgress(p.stage, (tasks ?? []).filter((t) => t.project_id === p.id), stage.progress);
            return (
              <Link key={p.id} href={`/portal/projects/${p.id}`} className={`${portalCard} block p-5 transition hover:border-orange-200`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{p.name}</p>
                    {p.description && <p className="mt-0.5 line-clamp-1 text-sm text-stone-500">{p.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill label={stage.label} tone={stage.tone} dot />
                    <ChevronRight className="h-4 w-4 text-stone-300" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <ProgressBar value={progress} />
                  <span className="text-xs font-medium text-stone-500">{progress}%</span>
                </div>
                {p.due_date && <p className="mt-2 text-xs text-stone-400">Due {formatDate(p.due_date)}</p>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

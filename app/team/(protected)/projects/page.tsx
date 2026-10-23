import Link from "next/link";
import { ChevronRight, FolderKanban } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getTeamSession } from "@/lib/team/session";
import { getTeamProjects } from "@/lib/team/data";
import { PORTAL_STAGE } from "@/lib/portal/status";
import { formatDate, formatMoney } from "@/lib/invoices";
import { EmptyState, PageHeader, StatusPill, portalCard } from "@/components/portal/ui";
import type { ProjectStage } from "@/lib/projects";

export default async function TeamProjectsPage() {
  const session = (await getTeamSession())!;
  const projects = await getTeamProjects(session);
  const clientIds = [...new Set(projects.map((p) => p.client_id))];
  const { data: clients } = clientIds.length ? await createServiceRoleClient().from("clients").select("id, company_name").in("id", clientIds) : { data: [] };
  const clientName = new Map((clients ?? []).map((c) => [c.id as string, c.company_name as string]));
  const showMoney = session.access.financials === "visible";

  return (
    <div>
      <PageHeader icon={FolderKanban} title="My Projects" subtitle={session.access.visibility === "all" ? "Every active client project." : "Projects you're assigned to."} />
      {projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects yet" description="When you're added to a project's team, it appears here." />
      ) : (
        <div className="space-y-3">
          {projects.map((p) => {
            const stage = PORTAL_STAGE[p.stage as ProjectStage];
            return (
              <Link key={p.id} href={`/team/projects/${p.id}`} className={`${portalCard} flex items-center gap-3 p-5 transition hover:border-orange-200`}>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{p.name}</p>
                  <p className="truncate text-sm text-stone-500">
                    {clientName.get(p.client_id) ?? "-"}
                    {p.due_date && ` · due ${formatDate(p.due_date)}`}
                    {showMoney && p.budget != null && ` · ${formatMoney(Number(p.budget), p.currency)}`}
                  </p>
                </div>
                <StatusPill label={stage.label} tone={stage.tone} dot />
                <ChevronRight className="h-4 w-4 text-stone-300" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

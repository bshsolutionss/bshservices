import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { cn } from "@/lib/utils";
import { PROJECT_STAGES, PROJECT_STAGE_LABELS, type Project, type ProjectStage } from "@/lib/projects";
import type { Client } from "@/lib/clients";
import { PageHeader } from "@/components/admin/ui";
import ProjectCreateButton from "@/components/admin/projects/ProjectCreateButton";
import ProjectsTable from "@/components/admin/projects/ProjectsTable";

export const dynamic = "force-dynamic";

function isProjectStage(value: string | undefined): value is ProjectStage {
  return !!value && (PROJECT_STAGES as string[]).includes(value);
}

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; archived?: string }>;
}) {
  const { stage: stageParam, archived: archivedParam } = await searchParams;
  const activeStage = isProjectStage(stageParam) ? stageParam : undefined;
  const showArchived = archivedParam === "1";

  const supabase = createServiceRoleClient();
  let query = supabase
    .from("projects")
    .select("*")
    .eq("archived", showArchived)
    .order("created_at", { ascending: false })
    .limit(200);
  if (activeStage) query = query.eq("stage", activeStage);

  const [{ data: projectsData }, { data: clientsData }, { data: stageCountsData }] = await Promise.all([
    query,
    supabase.from("clients").select("id, company_name").order("company_name"),
    // Stage counts for the filter chips — fetched unfiltered so each chip can
    // show how many projects it holds, which the old chips couldn't.
    supabase.from("projects").select("stage").eq("archived", showArchived),
  ]);

  const projects = (projectsData ?? []) as Project[];
  const clients = (clientsData ?? []) as Pick<Client, "id" | "company_name">[];
  const clientNames = new Map(clients.map((c) => [c.id, c.company_name]));

  const stageCounts = new Map<string, number>();
  for (const row of (stageCountsData ?? []) as { stage: string }[]) {
    stageCounts.set(row.stage, (stageCounts.get(row.stage) ?? 0) + 1);
  }
  const totalCount = ((stageCountsData ?? []) as unknown[]).length;

  const stageHref = (stage?: ProjectStage) => {
    const params = new URLSearchParams();
    if (stage) params.set("stage", stage);
    if (showArchived) params.set("archived", "1");
    const qs = params.toString();
    return qs ? `/admin/projects?${qs}` : "/admin/projects";
  };

  const chipClass = (active: boolean) =>
    cn(
      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
      active
        ? "bg-[#1A14A5] text-white shadow-sm"
        : "border border-[#1A14A5]/10 bg-white text-[#231F20]/70 hover:border-[#1A14A5]/30"
    );
  const countClass = (active: boolean) =>
    cn("rounded-full px-1.5 text-xs font-bold", active ? "bg-white/20" : "bg-[#F4F7FE] text-[#231F20]/50");

  return (
    <div className="space-y-6">
      <PageHeader
        title={showArchived ? "Archived projects" : "Projects"}
        subtitle={`${projects.length} project${projects.length === 1 ? "" : "s"}${
          activeStage ? ` in ${PROJECT_STAGE_LABELS[activeStage]}` : ""
        }`}
        actions={
          <>
            <Link
              href={
                showArchived
                  ? stageHref(activeStage)
                  : `/admin/projects?archived=1${activeStage ? `&stage=${activeStage}` : ""}`
              }
              className="text-sm font-medium text-[#231F20]/60 hover:text-[#1A14A5]"
            >
              {showArchived ? "← Active projects" : "View archived →"}
            </Link>
            <ProjectCreateButton clients={clients} />
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <Link href={stageHref()} className={chipClass(!activeStage)}>
            All <span className={countClass(!activeStage)}>{totalCount}</span>
          </Link>
          {PROJECT_STAGES.map((stage) => {
            const active = activeStage === stage;
            return (
              <Link key={stage} href={stageHref(stage)} className={chipClass(active)}>
                {PROJECT_STAGE_LABELS[stage]}
                <span className={countClass(active)}>{stageCounts.get(stage) ?? 0}</span>
              </Link>
            );
          })}
        </div>
      </PageHeader>

      <ProjectsTable
        projects={projects.map((p) => ({ ...p, clientName: clientNames.get(p.client_id) || "—" }))}
        emptyMessage={`No ${showArchived ? "archived " : ""}projects found.`}
      />
    </div>
  );
}

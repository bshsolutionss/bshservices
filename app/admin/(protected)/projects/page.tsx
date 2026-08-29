import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { cn } from "@/lib/utils";
import { PROJECT_STAGES, PROJECT_STAGE_LABELS, type Project, type ProjectStage } from "@/lib/projects";
import type { Client } from "@/lib/clients";
import NewProjectInlineForm from "@/components/admin/NewProjectInlineForm";
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

  const [{ data: projectsData }, { data: clientsData }] = await Promise.all([
    query,
    supabase.from("clients").select("id, company_name"),
  ]);

  const projects = (projectsData ?? []) as Project[];
  const clientNames = new Map((clientsData ?? []).map((c: Pick<Client, "id" | "company_name">) => [c.id, c.company_name]));

  const stageHref = (stage?: ProjectStage) => {
    const params = new URLSearchParams();
    if (stage) params.set("stage", stage);
    if (showArchived) params.set("archived", "1");
    const qs = params.toString();
    return qs ? `/admin/projects?${qs}` : "/admin/projects";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-[#231F20]">Projects</h1>
          <p className="text-[#231F20]/60 text-sm mt-1">
            {projects.length} project{projects.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href={showArchived ? stageHref(activeStage) : `/admin/projects?archived=1${activeStage ? `&stage=${activeStage}` : ""}`}
          className="text-sm font-medium text-[#231F20]/60 hover:text-[#1A14A5]"
        >
          {showArchived ? "← Back to active projects" : "View archived →"}
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={stageHref()}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-semibold transition",
            !activeStage ? "bg-[#1A14A5] text-white" : "bg-white text-[#231F20]/70 border border-[#1A14A5]/10"
          )}
        >
          All
        </Link>
        {PROJECT_STAGES.map((stage) => (
          <Link
            key={stage}
            href={stageHref(stage)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold transition",
              activeStage === stage ? "bg-[#1A14A5] text-white" : "bg-white text-[#231F20]/70 border border-[#1A14A5]/10"
            )}
          >
            {PROJECT_STAGE_LABELS[stage]}
          </Link>
        ))}
      </div>

      <ProjectsTable
        projects={projects.map((p) => ({ ...p, clientName: clientNames.get(p.client_id) || "—" }))}
        toolbarExtra={<NewProjectInlineForm clients={clientsData ?? []} triggerVariant="solid" />}
        emptyMessage={`No ${showArchived ? "archived " : ""}projects found.`}
      />
    </div>
  );
}

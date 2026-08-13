import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { cn } from "@/lib/utils";
import { PROJECT_STAGES, PROJECT_STAGE_LABELS, PROJECT_STAGE_COLORS, type Project, type ProjectStage } from "@/lib/projects";
import type { Client } from "@/lib/clients";
import NewProjectInlineForm from "@/components/admin/NewProjectInlineForm";

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
        <div className="flex items-center gap-4">
          <Link
            href={showArchived ? stageHref(activeStage) : `/admin/projects?archived=1${activeStage ? `&stage=${activeStage}` : ""}`}
            className="text-sm font-medium text-[#231F20]/60 hover:text-[#1A14A5]"
          >
            {showArchived ? "← Back to active projects" : "View archived →"}
          </Link>
          <NewProjectInlineForm clients={clientsData ?? []} triggerVariant="solid" />
        </div>
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

      <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1A14A5]/10 text-left text-[#231F20]/50">
              <th className="px-6 py-3 font-medium">Project</th>
              <th className="px-6 py-3 font-medium">Client</th>
              <th className="px-6 py-3 font-medium">Service</th>
              <th className="px-6 py-3 font-medium">Amount</th>
              <th className="px-6 py-3 font-medium">Due</th>
              <th className="px-6 py-3 font-medium">Stage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A14A5]/5">
            {projects.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-[#231F20]/50">
                  No {showArchived ? "archived" : ""} projects found.
                </td>
              </tr>
            )}
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-[#F4F7FE] transition">
                <td className="px-6 py-4">
                  <Link href={`/admin/projects/${project.id}`} className="font-medium text-[#1A14A5] hover:underline">
                    {project.name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-[#231F20]/70">{clientNames.get(project.client_id) || "—"}</td>
                <td className="px-6 py-4 text-[#231F20]/70">{project.service_category || "—"}</td>
                <td className="px-6 py-4 text-[#231F20]/70">
                  {project.budget !== null ? `$${Number(project.budget).toLocaleString()}` : "—"}
                </td>
                <td className="px-6 py-4 text-[#231F20]/50 text-xs whitespace-nowrap">
                  {project.due_date ? new Date(project.due_date).toLocaleDateString() : "—"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{
                      background: PROJECT_STAGE_COLORS[project.stage].bg,
                      color: PROJECT_STAGE_COLORS[project.stage].text,
                    }}
                  >
                    {PROJECT_STAGE_LABELS[project.stage]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

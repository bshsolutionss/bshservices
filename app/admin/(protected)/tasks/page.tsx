import Link from "next/link";
import { CheckSquare } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { cn } from "@/lib/utils";
import { TASK_STATUSES, TASK_STATUS_LABELS, type AssigneeOption, type Task, type TaskStatus } from "@/lib/tasks";
import type { Project } from "@/lib/projects";
import { EmptyState, PageHeader, SectionCard } from "@/components/admin/ui";
import TaskRow from "@/components/admin/TaskRow";
import NewTaskInlineForm from "@/components/admin/NewTaskInlineForm";

export const dynamic = "force-dynamic";

function isTaskStatus(value: string | undefined): value is TaskStatus {
  return !!value && (TASK_STATUSES as string[]).includes(value);
}

export default async function AdminTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; project?: string }>;
}) {
  const { status: statusParam, project: projectParam } = await searchParams;
  const activeStatus = isTaskStatus(statusParam) ? statusParam : undefined;

  const supabase = createServiceRoleClient();
  let query = supabase.from("tasks").select("*").order("due_date", { ascending: true, nullsFirst: false }).limit(300);
  if (activeStatus) query = query.eq("status", activeStatus);
  if (projectParam) query = query.eq("project_id", projectParam);

  const [{ data: tasksData }, { data: projectsData }, { data: employeesData }, { data: statusCountsData }] =
    await Promise.all([
      query,
      supabase.from("projects").select("id, name"),
      supabase.from("employees").select("id, name, email").eq("status", "active").order("name"),
      // Unfiltered, so each chip can carry its own count.
      projectParam
        ? supabase.from("tasks").select("status").eq("project_id", projectParam)
        : supabase.from("tasks").select("status"),
    ]);

  const tasks = (tasksData ?? []) as Task[];
  const projects = (projectsData ?? []) as Pick<Project, "id" | "name">[];
  const projectNames = new Map(projects.map((p) => [p.id, p.name]));
  const assignees = (employeesData ?? []) as AssigneeOption[];

  const statusCounts = new Map<string, number>();
  for (const row of (statusCountsData ?? []) as { status: string }[]) {
    statusCounts.set(row.status, (statusCounts.get(row.status) ?? 0) + 1);
  }
  const totalCount = ((statusCountsData ?? []) as unknown[]).length;

  const filteredProjectName = projectParam ? projectNames.get(projectParam) : undefined;
  const hrefFor = (status?: TaskStatus) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (projectParam) params.set("project", projectParam);
    const qs = params.toString();
    return qs ? `/admin/tasks?${qs}` : "/admin/tasks";
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
        title="Tasks"
        subtitle={
          <>
            {tasks.length} task{tasks.length === 1 ? "" : "s"}
            {filteredProjectName && (
              <>
                {" in "}
                <Link href={`/admin/projects/${projectParam}`} className="font-medium text-[#1A14A5] hover:underline">
                  {filteredProjectName}
                </Link>
                {" · "}
                <Link href="/admin/tasks" className="font-medium text-[#1A14A5] hover:underline">
                  clear
                </Link>
              </>
            )}
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <Link href={hrefFor()} className={chipClass(!activeStatus)}>
            All <span className={countClass(!activeStatus)}>{totalCount}</span>
          </Link>
          {TASK_STATUSES.map((status) => {
            const active = activeStatus === status;
            return (
              <Link key={status} href={hrefFor(status)} className={chipClass(active)}>
                {TASK_STATUS_LABELS[status]}
                <span className={countClass(active)}>{statusCounts.get(status) ?? 0}</span>
              </Link>
            );
          })}
        </div>
      </PageHeader>

      <SectionCard title="New task" subtitle="Assign it to a team member and they are emailed straight away">
        <NewTaskInlineForm projectId={projectParam} projects={projects} assignees={assignees} />
      </SectionCard>

      <SectionCard padded={false} bodyClassName="px-5 sm:px-6">
        {tasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No tasks here"
            description="Add one above - pick a project, assign a team member, and they get an email."
          />
        ) : (
          <ul className="divide-y divide-[#1A14A5]/5">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                assignees={assignees}
                projectName={projectNames.get(task.project_id) || "—"}
              />
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

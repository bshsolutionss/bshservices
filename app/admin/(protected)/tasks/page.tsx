import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { cn } from "@/lib/utils";
import { TASK_STATUSES, TASK_STATUS_LABELS, type Task, type TaskStatus } from "@/lib/tasks";
import type { Project } from "@/lib/projects";
import TaskRow from "@/components/admin/TaskRow";

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

  const [{ data: tasksData }, { data: projectsData }, { data: employeesData }] = await Promise.all([
    query,
    supabase.from("projects").select("id, name"),
    supabase.from("employees").select("name").eq("status", "active").order("name"),
  ]);

  const tasks = (tasksData ?? []) as Task[];
  const projectNames = new Map((projectsData ?? []).map((p: Pick<Project, "id" | "name">) => [p.id, p.name]));
  const employeeNames = ((employeesData ?? []) as { name: string }[]).map((e) => e.name);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#231F20]">Tasks</h1>
        <p className="text-[#231F20]/60 text-sm mt-1">
          {tasks.length} task{tasks.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/tasks"
          className={cn(
            "px-4 py-2 rounded-full text-sm font-semibold transition",
            !activeStatus ? "bg-[#1A14A5] text-white" : "bg-white text-[#231F20]/70 border border-[#1A14A5]/10"
          )}
        >
          All
        </Link>
        {TASK_STATUSES.map((status) => (
          <Link
            key={status}
            href={`/admin/tasks?status=${status}`}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold transition",
              activeStatus === status ? "bg-[#1A14A5] text-white" : "bg-white text-[#231F20]/70 border border-[#1A14A5]/10"
            )}
          >
            {TASK_STATUS_LABELS[status]}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 p-6">
        {tasks.length === 0 ? (
          <p className="text-sm text-[#231F20]/50 py-4 text-center">
            No tasks found. Add tasks from a project&apos;s detail page.
          </p>
        ) : (
          <ul className="divide-y divide-[#1A14A5]/5">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                employeeNames={employeeNames}
                projectName={projectNames.get(task.project_id) || "—"}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { cn } from "@/lib/utils";
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  type Task,
  type TaskStatus,
  type TaskPriority,
} from "@/lib/tasks";
import type { Project } from "@/lib/projects";
import TaskStatusInlineControl from "@/components/admin/TaskStatusInlineControl";

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

  const [{ data: tasksData }, { data: projectsData }] = await Promise.all([
    query,
    supabase.from("projects").select("id, name"),
  ]);

  const tasks = (tasksData ?? []) as Task[];
  const projectNames = new Map((projectsData ?? []).map((p: Pick<Project, "id" | "name">) => [p.id, p.name]));

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

      <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1A14A5]/10 text-left text-[#231F20]/50">
              <th className="px-6 py-3 font-medium">Task</th>
              <th className="px-6 py-3 font-medium">Project</th>
              <th className="px-6 py-3 font-medium">Assignee</th>
              <th className="px-6 py-3 font-medium">Priority</th>
              <th className="px-6 py-3 font-medium">Due</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A14A5]/5">
            {tasks.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-[#231F20]/50">
                  No tasks found. Add tasks from a project&apos;s detail page.
                </td>
              </tr>
            )}
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-[#F4F7FE] transition">
                <td className="px-6 py-4 font-medium text-[#231F20]">{task.title}</td>
                <td className="px-6 py-4 text-[#231F20]/70">
                  <Link href={`/admin/projects/${task.project_id}`} className="hover:text-[#1A14A5] hover:underline">
                    {projectNames.get(task.project_id) || "—"}
                  </Link>
                </td>
                <td className="px-6 py-4 text-[#231F20]/70">{task.assignee_name || "—"}</td>
                <td className="px-6 py-4 text-[#231F20]/70">{TASK_PRIORITY_LABELS[task.priority as TaskPriority]}</td>
                <td className="px-6 py-4 text-[#231F20]/50 text-xs whitespace-nowrap">
                  {task.due_date ? new Date(task.due_date).toLocaleDateString() : "—"}
                </td>
                <td className="px-6 py-4">
                  <TaskStatusInlineControl taskId={task.id} initialStatus={task.status as TaskStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

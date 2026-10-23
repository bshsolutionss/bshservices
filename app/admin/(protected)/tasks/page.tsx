import Link from "next/link";
import { CheckSquare } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { ensureStatusOverrides } from "@/lib/admin/status-overrides";
import { cn } from "@/lib/utils";
import { TASK_STATUSES, TASK_STATUS_LABELS, type AssigneeOption, type Task, type TaskStatus } from "@/lib/tasks";
import type { Project } from "@/lib/projects";
import { EmptyState, PageHeader, SectionCard } from "@/components/admin/ui";
import TaskRow from "@/components/admin/TaskRow";
import NewTaskInlineForm from "@/components/admin/NewTaskInlineForm";
import { getAdminSession } from "@/lib/admin/session";
import NewBoardModal from "@/components/admin/tasks/NewBoardModal";
import { isUuid } from "@/lib/portal/admin-input";

export const dynamic = "force-dynamic";

function isTaskStatus(value: string | undefined): value is TaskStatus {
  return !!value && (TASK_STATUSES as string[]).includes(value);
}

export default async function AdminTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; project?: string; board?: string }>;
}) {
  const { status: statusParam, project: projectParam, board: boardRaw } = await searchParams;
  const boardParam = isUuid(boardRaw) ? boardRaw : undefined;
  const activeStatus = isTaskStatus(statusParam) ? statusParam : undefined;

  await ensureStatusOverrides();
  const session = await getAdminSession();
  // Employees see only their own tasks and can only move their status forward.
  const mineOnly = session?.role === "employee";
  const ownerId = session?.employeeId ?? "00000000-0000-0000-0000-000000000000";
  const supabase = createServiceRoleClient();
  let query = supabase.from("tasks").select("*").order("due_date", { ascending: true, nullsFirst: false }).limit(300);
  if (mineOnly) query = query.eq("assignee_id", ownerId);
  if (activeStatus) query = query.eq("status", activeStatus);
  if (projectParam) query = query.eq("project_id", projectParam);
  if (boardParam) query = query.eq("board_id", boardParam);

  const [{ data: tasksData }, { data: projectsData }, { data: employeesData }, { data: statusCountsData }, { data: boardsData }, { data: allTasksData }, { data: clientsData }] =
    await Promise.all([
      query,
      supabase.from("projects").select("id, name"),
      supabase.from("employees").select("id, name, email").eq("status", "active").order("name"),
      // Unfiltered, so each chip can carry its own count.
      (() => {
        let counts = supabase.from("tasks").select("status");
        if (projectParam) counts = counts.eq("project_id", projectParam);
        if (boardParam) counts = counts.eq("board_id", boardParam);
        if (mineOnly) counts = counts.eq("assignee_id", ownerId);
        return counts;
      })(),
      supabase.from("task_boards").select("id, name, color, description").eq("archived", false).order("created_at"),
      supabase.from("tasks").select("project_id, board_id, status, due_date"),
      supabase.from("clients").select("id, company_name").order("company_name"),
    ]);
  const boards = (boardsData ?? []) as { id: string; name: string; color: string; description: string | null }[];
  const boardNames = new Map(boards.map((b) => [b.id, b.name]));
  const allTasks = (allTasksData ?? []) as { project_id: string | null; board_id: string | null; status: string; due_date: string | null }[];
  const todayIso = new Date().toISOString().slice(0, 10);
  const openTasks = allTasks.filter((t) => t.status !== "completed");
  const overdueTasks = openTasks.filter((t) => t.due_date && t.due_date < todayIso).length;
  const countFor = (key: "project_id" | "board_id", id: string) => {
    const rows = allTasks.filter((t) => t[key] === id);
    return { open: rows.filter((t) => t.status !== "completed").length, total: rows.length };
  };
  const projectBoards = ((projectsData ?? []) as { id: string; name: string }[]).filter((p) => allTasks.some((t) => t.project_id === p.id));

  const tasks = (tasksData ?? []) as Task[];
  const projects = (projectsData ?? []) as Pick<Project, "id" | "name">[];
  const projectNames = new Map(projects.map((p) => [p.id, p.name]));
  const assignees = (employeesData ?? []) as AssigneeOption[];

  const statusCounts = new Map<string, number>();
  for (const row of (statusCountsData ?? []) as { status: string }[]) {
    statusCounts.set(row.status, (statusCounts.get(row.status) ?? 0) + 1);
  }
  const totalCount = ((statusCountsData ?? []) as unknown[]).length;

  const filteredProjectName = projectParam ? projectNames.get(projectParam) : boardParam ? boardNames.get(boardParam) : undefined;
  const hrefFor = (status?: TaskStatus) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (projectParam) params.set("project", projectParam);
    if (boardParam) params.set("board", boardParam);
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
        title={mineOnly ? "My tasks" : "Tasks"}
        subtitle={
          <>
            {mineOnly ? "Your assigned work, earliest deadline first. " : "Who is doing what, and by when. "}
            {tasks.length} task{tasks.length === 1 ? "" : "s"}
            {filteredProjectName && (
              <>
                {" in "}
                <Link href={projectParam ? `/admin/projects/${projectParam}` : "/admin/tasks"} className="font-medium text-[#1A14A5] hover:underline">
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

      {!mineOnly && !projectParam && !boardParam && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Boards", value: boards.length + projectBoards.length, warn: false },
              { label: "Open tasks", value: openTasks.length, warn: false },
              { label: "Overdue", value: overdueTasks, warn: overdueTasks > 0 },
              { label: "Finished", value: allTasks.length - openTasks.length, warn: false },
            ].map((c) => (
              <div key={c.label} className="rounded-2xl border border-[#1A14A5]/10 bg-white p-4 shadow-sm">
                <p className="text-xs text-[#231F20]/50">{c.label}</p>
                <p className={cn("text-2xl font-extrabold", c.warn && "text-red-600")}>{c.value}</p>
              </div>
            ))}
          </div>
          <SectionCard
            title="Boards"
            subtitle="Every project has its own board. Create more for internal work."
            action={<NewBoardModal clients={((clientsData ?? []) as { id: string; company_name: string }[]).map((c) => ({ id: c.id, name: c.company_name }))} />}
          >
            {boards.length + projectBoards.length === 0 ? (
              <p className="text-sm text-[#231F20]/50">No boards yet. Create one for internal work, or add a task to a project below.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {boards.map((b) => {
                  const n = countFor("board_id", b.id);
                  return (
                    <Link
                      key={b.id}
                      href={`/admin/tasks?board=${b.id}`}
                      className="flex items-center gap-3 rounded-xl border border-[#1A14A5]/10 bg-white p-3 transition hover:border-[#1A14A5]/30"
                      style={{ borderLeft: `4px solid ${b.color}` }}
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-xs font-bold" style={{ background: `${b.color}22`, color: b.color }}>
                        {b.name.slice(0, 3).toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{b.name}</span>
                        <span className="block text-xs text-[#231F20]/50">
                          {n.open} open · {n.total} total
                        </span>
                      </span>
                    </Link>
                  );
                })}
                {projectBoards.map((p) => {
                  const n = countFor("project_id", p.id);
                  return (
                    <Link
                      key={p.id}
                      href={`/admin/tasks?project=${p.id}`}
                      className="flex items-center gap-3 rounded-xl border border-[#1A14A5]/10 bg-white p-3 transition hover:border-[#1A14A5]/30"
                      style={{ borderLeft: "4px solid #1A14A5" }}
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#E8E7FB] text-xs font-bold text-[#1A14A5]">{p.name.slice(0, 3).toUpperCase()}</span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{p.name}</span>
                        <span className="block text-xs text-[#231F20]/50">
                          Project · {n.open} open · {n.total} total
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {!mineOnly && (
        <SectionCard title="Assign a task" subtitle="Pick a project and a team member - they are emailed straight away">
          <NewTaskInlineForm projectId={projectParam} boardId={boardParam} boards={boards} projects={projects} assignees={assignees} />
        </SectionCard>
      )}

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
                readOnly={mineOnly}
                projectName={(task.project_id ? projectNames.get(task.project_id) : task.board_id ? boardNames.get(task.board_id) : undefined) || "-"}
              />
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

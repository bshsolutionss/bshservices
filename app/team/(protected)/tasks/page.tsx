import { KanbanSquare } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getTeamSession } from "@/lib/team/session";
import { ensureStatusOverrides } from "@/lib/admin/status-overrides";
import { TASK_PRIORITY_LABELS, TASK_STATUS_COLORS, TASK_STATUS_LABELS, type TaskPriority, type TaskStatus } from "@/lib/tasks";
import { formatDate } from "@/lib/invoices";
import { todayInPkt } from "@/lib/availability";
import { EmptyState, PageHeader, SectionLabel, StatusPill, portalCard } from "@/components/portal/ui";
import TaskStatusInlineControl from "@/components/admin/TaskStatusInlineControl";

const one = <T,>(v: T | T[] | null | undefined): T | null => (Array.isArray(v) ? (v[0] ?? null) : (v ?? null));

export default async function TeamTasksPage() {
  const session = (await getTeamSession())!;
  await ensureStatusOverrides();
  const { data } = await createServiceRoleClient()
    .from("tasks")
    .select("id, title, description, status, priority, due_date, projects(name), task_boards(name)")
    .eq("assignee_id", session.employeeId)
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(300);

  type Row = { id: string; title: string; description: string | null; status: TaskStatus; priority: TaskPriority; due_date: string | null; projects: { name: string } | { name: string }[] | null; task_boards: { name: string } | { name: string }[] | null };
  const rows = (data ?? []) as unknown as Row[];
  const open = rows.filter((r) => r.status !== "completed");
  const done = rows.filter((r) => r.status === "completed");
  const today = todayInPkt();

  const list = (items: Row[]) => (
    <div className={`${portalCard} divide-y divide-stone-100 overflow-hidden`}>
      {items.map((t) => {
        const late = t.status !== "completed" && t.due_date && t.due_date < today;
        return (
          <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div className="min-w-0">
              <p className="font-medium">{t.title}</p>
              <p className="text-xs text-stone-500">
                {one(t.projects)?.name ?? one(t.task_boards)?.name ?? "Task"} · {TASK_PRIORITY_LABELS[t.priority]} priority{t.due_date ? ` · Due ${formatDate(t.due_date)}` : ""}
              </p>
              {t.description && <p className="mt-1 line-clamp-2 text-sm text-stone-600">{t.description}</p>}
            </div>
            <div className="flex items-center gap-3">
              {late && <StatusPill label="Overdue" tone="red" />}
              <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: TASK_STATUS_COLORS[t.status].bg, color: TASK_STATUS_COLORS[t.status].text }}>
                {TASK_STATUS_LABELS[t.status]}
              </span>
              <TaskStatusInlineControl taskId={t.id} initialStatus={t.status} />
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div>
      <PageHeader icon={KanbanSquare} title="Tasks" subtitle="Everything assigned to you. Change the status as you make progress." />
      {open.length === 0 ? <EmptyState icon={KanbanSquare} title="No open tasks" description="When a manager assigns you a task, it appears here and you'll get an email." /> : list(open)}
      {done.length > 0 && (
        <>
          <SectionLabel>Completed</SectionLabel>
          {list(done)}
        </>
      )}
    </div>
  );
}

import { CheckSquare, ClipboardCheck, Clock, FolderKanban, TriangleAlert } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getAttention, dueText } from "@/lib/admin/attention";
import { TASK_STATUS_COLORS, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, type TaskPriority, type TaskStatus } from "@/lib/tasks";
import { formatDate } from "@/lib/invoices";
import { Badge, EmptyState, PageHeader, SectionCard, StatCard } from "@/components/admin/ui";
import AttentionPanel from "@/components/admin/dashboard/AttentionPanel";
import TaskStatusInlineControl from "@/components/admin/TaskStatusInlineControl";

const one = <T,>(value: T | T[] | null | undefined): T | null => (Array.isArray(value) ? (value[0] ?? null) : (value ?? null));

/* ───────────────────────── Manager: the team, its deadlines and approvals ───────────────────────── */

export async function ManagerDashboard() {
  const supabase = createServiceRoleClient();
  const [attention, { data: openTasks }, { count: activeProjects }] = await Promise.all([
    getAttention({ scope: "all", includeMoney: false, includeClientData: true }),
    supabase.from("tasks").select("assignee_id, assignee_name, status, due_date").neq("status", "completed").limit(1000),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("archived", false).neq("stage", "completed"),
  ]);

  const today = attention.today;
  const workload = new Map<string, { name: string; open: number; overdue: number; review: number }>();
  for (const t of (openTasks ?? []) as { assignee_id: string | null; assignee_name: string | null; status: string; due_date: string | null }[]) {
    const key = t.assignee_id ?? "unassigned";
    const row = workload.get(key) ?? { name: t.assignee_name ?? "Unassigned", open: 0, overdue: 0, review: 0 };
    row.open += 1;
    if (t.status === "review") row.review += 1;
    else if (t.due_date && t.due_date < today) row.overdue += 1;
    workload.set(key, row);
  }
  const people = [...workload.values()].sort((a, b) => b.overdue - a.overdue || b.open - a.open);

  return (
    <div className="space-y-8">
      <PageHeader title="Team dashboard" subtitle="What your team is working on, what is late, and what needs your approval." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Waiting for approval" value={attention.awaitingApproval.length} icon={ClipboardCheck} iconBg="#1A14A5" description="Tasks in review" href="/admin/tasks?status=review" />
        <StatCard label="Overdue tasks" value={attention.overdueTasks.length} icon={TriangleAlert} iconBg="#dc2626" valueColor={attention.overdueTasks.length ? "#B91C1C" : undefined} description="Past their deadline" href="/admin/tasks" />
        <StatCard label="Open tasks" value={(openTasks ?? []).length} icon={CheckSquare} iconBg="#0d9488" description="Not yet completed" href="/admin/tasks" />
        <StatCard label="Active projects" value={activeProjects ?? 0} icon={FolderKanban} iconBg="#7c3aed" description="Client projects in progress" href="/admin/projects" />
      </div>

      <AttentionPanel attention={attention} canApprove />

      <SectionCard title="Team workload" subtitle="Who has what - the busiest and the latest first">
        {people.length === 0 ? (
          <EmptyState icon={CheckSquare} title="No open tasks" description="Assign a task to a team member and their workload appears here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[#231F20]/50">
                  <th className="py-2 pr-4 font-semibold">Team member</th>
                  <th className="py-2 pr-4 font-semibold">Open tasks</th>
                  <th className="py-2 pr-4 font-semibold">Overdue</th>
                  <th className="py-2 font-semibold">In review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A14A5]/5">
                {people.map((p) => (
                  <tr key={p.name}>
                    <td className="py-2.5 pr-4 font-medium text-[#231F20]">{p.name}</td>
                    <td className="py-2.5 pr-4">{p.open}</td>
                    <td className="py-2.5 pr-4">
                      {p.overdue > 0 ? <Badge label={`${p.overdue} overdue`} colors={{ bg: "#FEE2E2", text: "#991B1B" }} /> : <span className="text-[#231F20]/40">None</span>}
                    </td>
                    <td className="py-2.5">{p.review > 0 ? `${p.review} waiting` : <span className="text-[#231F20]/40">None</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

/* ───────────────────────── Employee: my tasks and deadlines ───────────────────────── */

export async function EmployeeDashboard({ employeeId, name }: { employeeId: string | null; name: string | null }) {
  const supabase = createServiceRoleClient();

  if (!employeeId) {
    return (
      <div className="space-y-6">
        <PageHeader title="My work" subtitle="Your tasks and deadlines." />
        <div className="rounded-2xl border border-[#1A14A5]/10 bg-white shadow-sm">
          <EmptyState
            icon={CheckSquare}
            title="Your login isn't linked to a team member yet"
            description="Ask an admin to link your account to your team profile (Settings → Users & roles), then your tasks will show up here."
          />
        </div>
      </div>
    );
  }

  const [attention, { data }] = await Promise.all([
    getAttention({ scope: "mine", employeeId, includeMoney: false, includeClientData: false }),
    supabase
      .from("tasks")
      .select("id, title, status, priority, due_date, project_id, projects(name)")
      .eq("assignee_id", employeeId)
      .neq("status", "completed")
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(100),
  ]);

  type Row = { id: string; title: string; status: TaskStatus; priority: TaskPriority; due_date: string | null; project_id: string; projects: { name: string } | { name: string }[] | null };
  const tasks = (data ?? []) as unknown as Row[];
  const today = attention.today;

  return (
    <div className="space-y-8">
      <PageHeader title="My work" subtitle={`${name ? `Hi ${name.split(" ")[0]} - ` : ""}your tasks, deadlines and what to do next.`} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Open tasks" value={tasks.length} icon={CheckSquare} iconBg="#1A14A5" description="Assigned to you" />
        <StatCard label="Overdue" value={attention.overdueTasks.length} icon={TriangleAlert} iconBg="#dc2626" valueColor={attention.overdueTasks.length ? "#B91C1C" : undefined} description="Do these first" />
        <StatCard label="Due this week" value={attention.dueSoonTasks.length} icon={Clock} iconBg="#f97316" description="Next 7 days" />
        <StatCard label="Waiting for review" value={attention.awaitingApproval.length} icon={ClipboardCheck} iconBg="#0d9488" description="With your manager" />
      </div>

      <AttentionPanel attention={attention} canApprove={false} title="Do these first" subtitle="Overdue work and what is coming up." showTeamOwner={false} />

      <SectionCard title="All my open tasks" subtitle="Change the status as you make progress - your manager sees it straight away">
        {tasks.length === 0 ? (
          <EmptyState icon={CheckSquare} title="No open tasks" description="When a manager assigns you a task, it will appear here and you will get an email." />
        ) : (
          <ul className="divide-y divide-[#1A14A5]/5">
            {tasks.map((t) => {
              const late = t.due_date ? Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${t.due_date}T00:00:00Z`)) / 86_400_000) : null;
              return (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#231F20]">{t.title}</p>
                    <p className="text-xs text-[#231F20]/55">
                      {one(t.projects)?.name ?? "Project"}
                      {" · "}
                      {TASK_PRIORITY_LABELS[t.priority]} priority
                      {t.due_date ? ` · Due ${formatDate(t.due_date)}` : " · No deadline"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {late !== null && late > 0 && <Badge label={dueText(late)} colors={{ bg: "#FEE2E2", text: "#991B1B" }} />}
                    {late === 0 && <Badge label="Due today" colors={{ bg: "#FEF3C7", text: "#92400E" }} />}
                    <Badge label={TASK_STATUS_LABELS[t.status]} colors={TASK_STATUS_COLORS[t.status]} />
                    <TaskStatusInlineControl taskId={t.id} initialStatus={t.status} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

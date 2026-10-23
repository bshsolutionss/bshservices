import { KanbanSquare } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getPortalSession } from "@/lib/portal/session";
import { getVisibleProjects } from "@/lib/portal/data";
import { formatDate } from "@/lib/invoices";
import { EmptyState, PageHeader, SectionLabel, portalCard } from "@/components/portal/ui";

const COLUMNS = [
  { key: "todo", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "review", label: "In review" },
  { key: "completed", label: "Done" },
] as const;

export default async function PortalTasksPage() {
  const session = (await getPortalSession())!;
  const projects = await getVisibleProjects(session.clientId);
  const ids = projects.map((p) => p.id);
  // Only tasks the team explicitly shared; internal notes, assignees and hours are never selected.
  const { data: tasks } = ids.length
    ? await createServiceRoleClient()
        .from("tasks")
        .select("id, project_id, title, status, due_date")
        .in("project_id", ids)
        .eq("client_visible", true)
        .order("created_at")
    : { data: [] as { id: string; project_id: string; title: string; status: string; due_date: string | null }[] };

  const withTasks = projects.filter((p) => (tasks ?? []).some((t) => t.project_id === p.id));

  return (
    <div>
      <PageHeader icon={KanbanSquare} title="Tasks" subtitle="Boards your team has shared with you - follow the work as it moves." />
      {withTasks.length === 0 ? (
        <EmptyState icon={KanbanSquare} title="No task boards yet" description="When your team shares a task board with you, it will appear here." />
      ) : (
        withTasks.map((p) => (
          <div key={p.id}>
            <SectionLabel>{p.name}</SectionLabel>
            <div className="grid gap-3 md:grid-cols-4">
              {COLUMNS.map((col) => {
                const items = (tasks ?? []).filter((t) => t.project_id === p.id && t.status === col.key);
                return (
                  <div key={col.key} className="rounded-3xl bg-stone-100/70 p-3">
                    <p className="mb-2 px-1 text-xs font-semibold text-stone-500">
                      {col.label} <span className="font-normal text-stone-400">{items.length}</span>
                    </p>
                    <div className="space-y-2">
                      {items.map((t) => (
                        <div key={t.id} className={`${portalCard} rounded-2xl p-3`}>
                          <p className="text-sm font-medium">{t.title}</p>
                          {t.due_date && <p className="mt-1 text-xs text-stone-400">Due {formatDate(t.due_date)}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, CalendarCheck, CheckSquare, Clock, FolderKanban, Target, TrendingUp, Wallet } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getTeamSession } from "@/lib/team/session";
import { getTeamProjects } from "@/lib/team/data";
import { getEarnings } from "@/lib/team/earnings";
import { PORTAL_STAGE } from "@/lib/portal/status";
import { greeting } from "@/lib/portal/format";
import { formatDate, formatMoney } from "@/lib/invoices";
import { TASK_PRIORITY_LABELS, type TaskPriority } from "@/lib/tasks";
import { todayInPkt } from "@/lib/availability";
import { EmptyState, SectionLabel, StatCard, StatusPill, portalCard } from "@/components/portal/ui";
import type { ProjectStage } from "@/lib/projects";

const one = <T,>(v: T | T[] | null | undefined): T | null => (Array.isArray(v) ? (v[0] ?? null) : (v ?? null));

function Panel({ icon: Icon, title, count, href, hrefLabel, children }: { icon: typeof Clock; title: string; count?: number; href?: string; hrefLabel?: string; children: React.ReactNode }) {
  return (
    <div className={`${portalCard} p-5`}>
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-2 font-semibold">
          <Icon className="h-4 w-4 text-stone-400" /> {title}
          {count !== undefined && <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500">{count}</span>}
        </p>
        {href && (
          <Link href={href} className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:underline">
            {hrefLabel} <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

export default async function TeamDashboardPage() {
  const session = (await getTeamSession())!;
  const service = createServiceRoleClient();
  const today = todayInPkt();
  const projects = await getTeamProjects(session);
  const projectIds = projects.map((p) => p.id);
  const clientIds = [...new Set(projects.map((p) => p.client_id))];
  const canMeetings = session.access.meetings !== "none";
  const canLeads = session.access.leads !== "none";

  const [{ data: tasks }, earnings, meetingsRes, leadsRes, activityRes, clientsRes] = await Promise.all([
    service
      .from("tasks")
      .select("id, title, priority, due_date, status, projects(name), task_boards(name)")
      .eq("assignee_id", session.employeeId)
      .neq("status", "completed")
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(8),
    getEarnings(session.employeeId),
    canMeetings && clientIds.length
      ? service.from("meetings").select("id, title, starts_at, link_url").in("client_id", clientIds).neq("status", "cancelled").gte("starts_at", `${today}T00:00:00`).lt("starts_at", `${today}T23:59:59`).order("starts_at")
      : Promise.resolve({ data: [] as { id: string; title: string; starts_at: string; link_url: string | null }[] }),
    canLeads
      ? service.from("leads").select("id, name, business, reminder_at").eq("assigned_to", session.employeeId).not("reminder_at", "is", null).lte("reminder_at", new Date().toISOString()).order("reminder_at").limit(6)
      : Promise.resolve({ data: [] as { id: string; name: string; business: string | null; reminder_at: string }[] }),
    projectIds.length
      ? service.from("activities").select("id, description, created_at").eq("entity_type", "project").in("entity_id", projectIds).order("created_at", { ascending: false }).limit(6)
      : Promise.resolve({ data: [] as { id: string; description: string; created_at: string }[] }),
    clientIds.length ? service.from("clients").select("id, company_name").in("id", clientIds) : Promise.resolve({ data: [] as { id: string; company_name: string }[] }),
  ]);

  const clientName = new Map((clientsRes.data ?? []).map((c) => [c.id, c.company_name]));
  const activeProjects = projects.filter((p) => p.stage !== "completed");
  const firstName = session.name.split(" ")[0];
  const openTasks = (tasks ?? []) as unknown as { id: string; title: string; priority: TaskPriority; due_date: string | null; projects: { name: string } | { name: string }[] | null; task_boards: { name: string } | { name: string }[] | null }[];

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">
        {greeting()}, {firstName}
      </h1>
      <p className="mt-1 text-sm text-stone-500">Overview of your assigned projects and earnings.</p>

      <SectionLabel hint="What needs you right now">Today</SectionLabel>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel icon={CheckSquare} title="My tasks" count={openTasks.length} href="/team/tasks" hrefLabel="All tasks">
          {openTasks.length === 0 ? (
            <p className="py-6 text-center text-sm text-stone-400">Nothing assigned to you right now.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {openTasks.map((t) => {
                const late = t.due_date && t.due_date < today;
                return (
                  <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{t.title}</p>
                      <p className="truncate text-xs text-stone-400">
                        {one(t.projects)?.name ?? one(t.task_boards)?.name ?? "Task"} · {TASK_PRIORITY_LABELS[t.priority]}
                      </p>
                    </div>
                    {t.due_date && <StatusPill label={late ? `Overdue ${formatDate(t.due_date)}` : `Due ${formatDate(t.due_date)}`} tone={late ? "red" : "stone"} />}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        {canMeetings && (
          <Panel icon={CalendarCheck} title="Meetings today" count={(meetingsRes.data ?? []).length} href="/team/meetings" hrefLabel="All meetings">
            {(meetingsRes.data ?? []).length === 0 ? (
              <p className="py-6 text-center text-sm text-stone-400">Nothing on your calendar today.</p>
            ) : (
              <ul className="divide-y divide-stone-100">
                {(meetingsRes.data ?? []).map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
                    <p className="truncate text-sm font-medium">{m.title}</p>
                    <span className="text-xs text-stone-500">{new Date(m.starts_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        )}

        {canLeads && (
          <Panel icon={Target} title="Follow-ups due" count={(leadsRes.data ?? []).length} href="/team/leads" hrefLabel="Pipeline">
            {(leadsRes.data ?? []).length === 0 ? (
              <p className="py-6 text-center text-sm text-stone-400">No leads assigned to you yet.</p>
            ) : (
              <ul className="divide-y divide-stone-100">
                {(leadsRes.data ?? []).map((l) => (
                  <li key={l.id} className="py-2.5 text-sm">
                    <span className="font-medium">{l.name}</span>
                    {l.business && <span className="text-stone-400"> · {l.business}</span>}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel icon={Wallet} title="Earnings summary" href="/team/payments" hrefLabel="All payments">
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: TrendingUp, label: "Paid this month", value: formatMoney(earnings.thisMonth, "PKR"), tone: "text-emerald-600" },
              { icon: Clock, label: "Pending salary", value: formatMoney(earnings.pending, "PKR"), tone: "text-amber-600" },
              { icon: Wallet, label: "Last payment", value: earnings.last ? formatMoney(earnings.last.amount, earnings.last.currency) : "None yet", tone: "text-stone-700" },
            ].map((c) => (
              <div key={c.label} className="rounded-xl bg-stone-50 p-3">
                <p className="text-[11px] text-stone-400">{c.label}</p>
                <p className={`mt-1 text-sm font-bold ${c.tone}`}>{c.value}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel icon={FolderKanban} title="Recent activity">
          {(activityRes.data ?? []).length === 0 ? (
            <p className="py-6 text-center text-sm text-stone-400">Nothing yet - new tasks and project updates for you will show up here.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {(activityRes.data ?? []).map((a) => (
                <li key={a.id} className="py-2 text-sm">
                  {a.description}
                  <span className="block text-[11px] text-stone-400">{formatDate(a.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={FolderKanban} value={projects.length} label="Total projects" />
        <StatCard icon={Wallet} value={formatMoney(earnings.total, "PKR")} label="Total earnings" tone="orange" />
        <StatCard icon={TrendingUp} value={formatMoney(earnings.total, "PKR")} label="Received" />
        <StatCard icon={Clock} value={formatMoney(earnings.pending, "PKR")} label="Pending" />
      </div>

      <SectionLabel>Active projects</SectionLabel>
      {activeProjects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No active projects" description="Projects you're assigned to will appear here." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {activeProjects.map((p) => {
            const stage = PORTAL_STAGE[p.stage as ProjectStage];
            return (
              <Link key={p.id} href={`/team/projects/${p.id}`} className={`${portalCard} block p-4 transition hover:border-orange-200`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{p.name}</p>
                  <StatusPill label={stage.label} tone={stage.tone} dot />
                </div>
                <p className="mt-1 text-xs text-stone-500">Client: {clientName.get(p.client_id) ?? "-"}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

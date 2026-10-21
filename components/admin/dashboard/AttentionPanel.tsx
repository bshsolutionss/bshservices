import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Badge, SectionCard } from "@/components/admin/ui";
import ReviewQueue from "@/components/admin/dashboard/ReviewQueue";
import { dueText, type Attention } from "@/lib/admin/attention";
import { formatDate, formatMoney } from "@/lib/invoices";

const OVERDUE = { bg: "#FEE2E2", text: "#991B1B" };
const SOON = { bg: "#FEF3C7", text: "#92400E" };

function Count({ n }: { n: number }) {
  return <span className="rounded-full bg-[#1A14A5]/10 px-2 py-0.5 text-xs font-bold text-[#1A14A5]">{n}</span>;
}

function More({ href, shown, total, label }: { href: string; shown: number; total: number; label: string }) {
  if (total <= shown) return null;
  return (
    <Link href={href} className="mt-3 inline-block text-sm font-medium text-[#1A14A5] hover:underline">
      {label} ({total - shown} more) →
    </Link>
  );
}

/**
 * "Needs your attention" - the first thing on a dashboard. Overdue and waiting
 * items come before anything historical, each one saying whose it is, how late
 * it is (in words) and what the next step is.
 */
export default function AttentionPanel({
  attention,
  canApprove,
  title = "Needs your attention",
  subtitle = "Overdue work, approvals and follow-ups - handle these first.",
  showTeamOwner = true,
}: {
  attention: Attention;
  canApprove: boolean;
  title?: string;
  subtitle?: string;
  /** Employees only see their own work, so "owner" is redundant for them. */
  showTeamOwner?: boolean;
}) {
  const { awaitingApproval, overdueTasks, dueSoonTasks, overdueInvoices, followUps, deadlineProjects } = attention;
  const total =
    awaitingApproval.length + overdueTasks.length + overdueInvoices.length + followUps.length + dueSoonTasks.length + deadlineProjects.length;

  if (total === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[#231F20]/60">{title}</h2>
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          <div>
            <p className="font-semibold text-emerald-900">You&apos;re all caught up</p>
            <p className="text-sm text-emerald-800/80">Nothing is overdue, waiting for approval or due this week.</p>
          </div>
        </div>
      </section>
    );
  }

  const owner = (name: string | null) => (showTeamOwner ? ` · Owner: ${name ?? "Unassigned"}` : "");

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-[#231F20]/60">{title}</h2>
        <p className="text-sm text-[#231F20]/55">{subtitle}</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {awaitingApproval.length > 0 && (
          <SectionCard
            title="Waiting for approval"
            subtitle="Finished work to check - approve it or send it back"
            action={<Count n={awaitingApproval.length} />}
          >
            <ReviewQueue
              canApprove={canApprove}
              linkProjects={showTeamOwner}
              items={awaitingApproval.slice(0, 5).map((t) => ({
                id: t.id,
                title: t.title,
                projectName: t.projectName,
                project_id: t.project_id,
                assignee_name: t.assignee_name,
                priority: t.priority,
                due_date: t.due_date,
              }))}
            />
            <More href="/admin/tasks?status=review" shown={5} total={awaitingApproval.length} label="See all waiting" />
          </SectionCard>
        )}

        {overdueTasks.length > 0 && (
          <SectionCard title="Overdue tasks" subtitle="Past their deadline and not finished" action={<Count n={overdueTasks.length} />}>
            <ul className="divide-y divide-[#1A14A5]/5">
              {overdueTasks.slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#231F20]">{t.title}</p>
                    <p className="text-xs text-[#231F20]/55">
                      {showTeamOwner ? (
                        <Link href={`/admin/projects/${t.project_id}`} className="hover:text-[#1A14A5] hover:underline">
                          {t.projectName}
                        </Link>
                      ) : (
                        t.projectName
                      )}
                      {owner(t.assignee_name)}
                    </p>
                  </div>
                  <Badge label={dueText(t.daysLate)} colors={OVERDUE} />
                </li>
              ))}
            </ul>
            <More href="/admin/tasks" shown={5} total={overdueTasks.length} label="See all tasks" />
          </SectionCard>
        )}

        {overdueInvoices.length > 0 && (
          <SectionCard title="Overdue invoices" subtitle="Payment is late - send a reminder" action={<Count n={overdueInvoices.length} />}>
            <ul className="divide-y divide-[#1A14A5]/5">
              {overdueInvoices.slice(0, 5).map((inv) => (
                <li key={inv.invoice_id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <Link href={`/admin/invoices/${inv.invoice_id}`} className="font-medium text-[#1A14A5] hover:underline">
                      {inv.invoice_number}
                    </Link>
                    <p className="truncate text-xs text-[#231F20]/55">
                      {inv.clientName} · {formatMoney(inv.balance, inv.currency)} unpaid
                    </p>
                  </div>
                  <Badge label={dueText(inv.daysLate)} colors={OVERDUE} />
                </li>
              ))}
            </ul>
            <More href="/admin/invoices" shown={5} total={overdueInvoices.length} label="See all invoices" />
          </SectionCard>
        )}

        {followUps.length > 0 && (
          <SectionCard title="Client follow-ups" subtitle="People you promised to get back to" action={<Count n={followUps.length} />}>
            <ul className="divide-y divide-[#1A14A5]/5">
              {followUps.slice(0, 5).map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#231F20]">{f.clientName}</p>
                    <p className="truncate text-xs text-[#231F20]/55">{f.subject ?? "Follow up"}</p>
                  </div>
                  <Badge label={f.daysLate > 0 ? dueText(f.daysLate) : f.daysLate === 0 ? "Due today" : `Due ${formatDate(f.follow_up_on)}`} colors={f.daysLate > 0 ? OVERDUE : SOON} />
                </li>
              ))}
            </ul>
            <Link href="/admin/communication" className="mt-3 inline-block text-sm font-medium text-[#1A14A5] hover:underline">
              Open communication →
            </Link>
          </SectionCard>
        )}

        {(dueSoonTasks.length > 0 || deadlineProjects.length > 0) && (
          <SectionCard
            title="Coming up"
            subtitle="Deadlines in the next 7–14 days"
            action={<Count n={dueSoonTasks.length + deadlineProjects.length} />}
          >
            <ul className="divide-y divide-[#1A14A5]/5">
              {dueSoonTasks.slice(0, 4).map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#231F20]">{t.title}</p>
                    <p className="text-xs text-[#231F20]/55">Task · {t.projectName}{owner(t.assignee_name)}</p>
                  </div>
                  <Badge label={dueText(t.daysLate)} colors={SOON} />
                </li>
              ))}
              {deadlineProjects.slice(0, 4).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <Link href={`/admin/projects/${p.id}`} className="truncate font-medium text-[#1A14A5] hover:underline">
                      {p.name}
                    </Link>
                    <p className="truncate text-xs text-[#231F20]/55">Project · {p.clientName}</p>
                  </div>
                  <Badge label={dueText(p.daysLate)} colors={p.daysLate > 0 ? OVERDUE : SOON} />
                </li>
              ))}
            </ul>
          </SectionCard>
        )}
      </div>
    </section>
  );
}

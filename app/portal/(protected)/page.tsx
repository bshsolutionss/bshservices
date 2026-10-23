import Link from "next/link";
import { ArrowRight, Box, CalendarCheck, CheckCircle2, ChevronRight, ClipboardList, FileText, FolderKanban, ListChecks, MessagesSquare, Receipt, Sparkles, Timer, Wallet } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getPortalSession } from "@/lib/portal/session";
import { getClientBalances, getPortalCounts, getVisibleProjects, projectProgress } from "@/lib/portal/data";
import { PORTAL_STAGE } from "@/lib/portal/status";
import { greeting, longDate, moneyByCurrency } from "@/lib/portal/format";
import { portalCard, EmptyState, ProgressBar, SectionLabel, StatCard, StatusPill } from "@/components/portal/ui";
import type { ProjectStage } from "@/lib/projects";

export default async function PortalHomePage() {
  const session = (await getPortalSession())!;
  const clientId = session.clientId;
  const service = createServiceRoleClient();

  const [projects, balances, counts] = await Promise.all([
    getVisibleProjects(clientId),
    getClientBalances(clientId),
    getPortalCounts(clientId),
  ]);
  const projectIds = projects.map((p) => p.id);
  const invoiceIds = balances.map((b) => b.invoice_id);

  const [tasksRes, paymentsRes, docsRes, meetingsRes, approvalsRes] = await Promise.all([
    projectIds.length
      ? service.from("tasks").select("project_id, status").in("project_id", projectIds).eq("client_visible", true)
      : Promise.resolve({ data: [] as { project_id: string; status: string }[] }),
    invoiceIds.length
      ? service.from("payments").select("invoice_id, amount").in("invoice_id", invoiceIds)
      : Promise.resolve({ data: [] as { invoice_id: string; amount: number }[] }),
    service.from("documents").select("id", { count: "exact", head: true }).eq("client_id", clientId).eq("shared", true).eq("category", "deliverable"),
    service.from("meetings").select("id", { count: "exact", head: true }).eq("client_id", clientId).eq("status", "held"),
    service.from("approvals").select("created_at, responded_at").eq("client_id", clientId).not("responded_at", "is", null),
  ]);

  const tasks = tasksRes.data ?? [];
  const active = projects.filter((p) => p.stage !== "completed");
  const completed = projects.filter((p) => p.stage === "completed");

  const outstanding = balances.filter((b) => b.balance > 0.005);
  const outstandingTotals = moneyByCurrency(outstanding.map((b) => ({ amount: Number(b.balance), currency: b.currency })));
  const overdueCount = outstanding.filter((b) => b.is_overdue).length;

  const currencyOf = new Map(balances.map((b) => [b.invoice_id, b.currency]));
  const paidTotals = moneyByCurrency((paymentsRes.data ?? []).map((p) => ({ amount: Number(p.amount), currency: currencyOf.get(p.invoice_id) ?? "PKR" })));
  const paidInvoices = balances.filter((b) => b.balance <= 0.005 && b.total > 0).length;

  const approvals = approvalsRes.data ?? [];
  const avgApprovalDays = approvals.length
    ? approvals.reduce((sum, a) => sum + (new Date(a.responded_at!).getTime() - new Date(a.created_at).getTime()), 0) / approvals.length / 86_400_000
    : null;

  const firstName = session.name.split(" ")[0];

  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400">{longDate()}</p>
      <h1 className="mt-1 text-4xl font-semibold tracking-tight">
        {greeting()}, {firstName}
      </h1>
      <p className="mt-2 text-sm text-stone-500">Here&apos;s where everything stands today.</p>

      <Link
        href="/portal/billing"
        className={`${portalCard} mt-6 flex items-center gap-4 p-5 transition hover:border-orange-200`}
      >
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${outstanding.length ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
          {outstanding.length ? <Wallet className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          {outstanding.length ? (
            <>
              <p className="font-semibold">
                {outstandingTotals} outstanding
                {overdueCount > 0 && <span className="ml-2 text-sm font-medium text-red-600">{overdueCount} overdue</span>}
              </p>
              <p className="text-sm text-stone-500">
                {outstanding.length} unpaid invoice{outstanding.length === 1 ? "" : "s"} - tap to view and download.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold">You&apos;re all settled</p>
              <p className="text-sm text-stone-500">No outstanding invoices. Thank you.</p>
            </>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-stone-300" />
      </Link>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={FolderKanban} value={active.length} label="Active projects" />
        <StatCard
          icon={ClipboardList}
          value={counts.pendingApprovals}
          label="Awaiting you"
          hint={counts.pendingApprovals ? "Needs your sign-off" : "Nothing pending"}
          tone={counts.pendingApprovals ? "orange" : "neutral"}
        />
        <StatCard icon={MessagesSquare} value={counts.unreadMessages} label="Unread messages" tone={counts.unreadMessages ? "orange" : "neutral"} />
        <StatCard icon={Wallet} value={outstanding.length} label="Invoices due" tone={outstanding.length ? "orange" : "neutral"} />
      </div>

      <SectionLabel
        action={
          <Link href="/portal/projects" className="inline-flex items-center gap-0.5 text-xs font-semibold text-orange-600 hover:underline">
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        }
      >
        Active projects
      </SectionLabel>
      {active.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No active projects" description="When we kick off a project, it'll show up here with live progress." />
      ) : (
        <div className="space-y-3">
          {active.slice(0, 4).map((p) => {
            const stage = PORTAL_STAGE[p.stage as ProjectStage];
            const progress = projectProgress(p.stage, tasks.filter((t) => t.project_id === p.id), stage.progress);
            return (
              <Link key={p.id} href={`/portal/projects/${p.id}`} className={`${portalCard} block p-5 transition hover:border-orange-200`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{p.name}</p>
                  <StatusPill label={stage.label} tone={stage.tone} dot />
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <ProgressBar value={progress} />
                  <span className="text-xs font-medium text-stone-500">{progress}%</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <SectionLabel hint="Everything we've shipped together.">Your delivery</SectionLabel>
      <div className={`${portalCard} flex items-center justify-between p-5`}>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400">Total invested to date</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{paidTotals}</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-100/80 text-orange-600">
          <Sparkles className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard icon={FolderKanban} value={active.length} label="Active projects" tone="orange" />
        <StatCard icon={CheckCircle2} value={completed.length} label="Completed projects" tone="orange" />
        <StatCard icon={Box} value={docsRes.count ?? 0} label="Deliverables shipped" tone="orange" />
        <StatCard icon={ListChecks} value={tasks.filter((t) => t.status === "completed").length} label="Tasks completed" tone="orange" />
        <StatCard
          icon={Timer}
          value={avgApprovalDays == null ? "-" : avgApprovalDays < 1 ? "<1 day" : `${avgApprovalDays.toFixed(1)} days`}
          label="Avg. approval time"
          tone="orange"
        />
        <StatCard icon={Receipt} value={`${paidInvoices} / ${balances.length}`} label="Invoices paid" tone="orange" />
        <StatCard icon={CalendarCheck} value={meetingsRes.count ?? 0} label="Meetings held" tone="orange" />
        <StatCard icon={Wallet} value={balances.length} label="Invoices issued" tone="orange" />
      </div>

      <SectionLabel>Jump to</SectionLabel>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { href: "/portal/billing", icon: Wallet, title: "Billing", sub: "Invoices & receipts" },
          { href: "/portal/documents", icon: FileText, title: "Documents", sub: "Contracts & files" },
          { href: "/portal/messages", icon: MessagesSquare, title: "Messages", sub: "Talk to the team" },
        ].map((l) => (
          <Link key={l.href} href={l.href} className={`${portalCard} flex items-center gap-3 p-4 transition hover:border-orange-200`}>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100/80 text-orange-600">
              <l.icon className="h-[18px] w-[18px]" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold">{l.title}</p>
              <p className="text-xs text-stone-500">{l.sub}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-stone-300" />
          </Link>
        ))}
      </div>
    </div>
  );
}

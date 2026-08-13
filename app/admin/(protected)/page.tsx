import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, type Lead, type LeadStatus } from "@/lib/leads";
import { formatMoney, type Currency } from "@/lib/invoices";

export const dynamic = "force-dynamic";

/** Sums can't cross currencies (PKR + USD isn't a number) — group by currency and format each. */
function formatByCurrency(amounts: { amount: number; currency: Currency }[]): string {
  const byCurrency = new Map<Currency, number>();
  for (const { amount, currency } of amounts) {
    byCurrency.set(currency, (byCurrency.get(currency) ?? 0) + Number(amount));
  }
  if (byCurrency.size === 0) return formatMoney(0, "USD");
  return Array.from(byCurrency.entries())
    .map(([currency, total]) => formatMoney(total, currency))
    .join(" + ");
}

async function getDashboardData() {
  const supabase = createServiceRoleClient();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    { data: allLeads },
    { count: dueFollowUps },
    { count: clientCount },
    { count: activeProjectCount },
    { data: tasksData },
    { data: paymentsThisMonth },
    { data: outstandingInvoices },
  ] = await Promise.all([
    supabase
      .from("leads")
      .select("id, name, email, status, selected_service, service_category, created_at")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("follow_up_completed", false)
      .in("status", ["new", "contacted"])
      .lte("next_follow_up_at", new Date().toISOString()),
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase.from("projects").select("id", { count: "exact", head: true }).neq("stage", "completed"),
    supabase.from("tasks").select("status"),
    supabase
      .from("payments")
      .select("amount, invoices(currency)")
      .gte("paid_on", startOfMonth.toISOString().slice(0, 10)),
    supabase.from("invoice_balances").select("balance, currency").in("status", ["sent", "partially_paid"]),
  ]);

  const leads = (allLeads ?? []) as Pick<
    Lead,
    "id" | "name" | "email" | "status" | "selected_service" | "service_category" | "created_at"
  >[];

  const counts: Record<LeadStatus, number> = {
    new: 0,
    contacted: 0,
    qualified: 0,
    meeting: 0,
    proposal_sent: 0,
    negotiation: 0,
    won: 0,
    lost: 0,
  };
  for (const lead of leads) {
    counts[lead.status as LeadStatus] = (counts[lead.status as LeadStatus] ?? 0) + 1;
  }

  const tasks = (tasksData ?? []) as { status: string }[];
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : null;

  const revenueThisMonth = formatByCurrency(
    (paymentsThisMonth ?? []).map((p: { amount: number; invoices: { currency: Currency } | { currency: Currency }[] | null }) => ({
      amount: p.amount,
      currency: (Array.isArray(p.invoices) ? p.invoices[0]?.currency : p.invoices?.currency) ?? "USD",
    }))
  );
  const totalOutstanding = formatByCurrency(
    (outstandingInvoices ?? []).map((i: { balance: number; currency: Currency | null }) => ({
      amount: i.balance,
      currency: i.currency ?? "USD",
    }))
  );

  return {
    total: leads.length,
    counts,
    dueFollowUps: dueFollowUps ?? 0,
    clientCount: clientCount ?? 0,
    activeProjectCount: activeProjectCount ?? 0,
    taskCompletionRate,
    revenueThisMonth,
    totalOutstanding,
    recent: leads.slice(0, 5),
  };
}

function StatTile({ value, label, color }: { value: string | number; label: string; color?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#1A14A5]/10">
      <p className="text-2xl font-extrabold break-words" style={{ color: color || "#1A14A5" }}>
        {value}
      </p>
      <p className="text-sm text-[#231F20]/60 mt-1">{label}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const {
    total,
    counts,
    dueFollowUps,
    clientCount,
    activeProjectCount,
    taskCompletionRate,
    revenueThisMonth,
    totalOutstanding,
    recent,
  } = await getDashboardData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#231F20]">Dashboard</h1>
        <p className="text-[#231F20]/60 text-sm mt-1">Overview of your pipeline, clients, and finances.</p>
      </div>

      {/* Business overview */}
      <div>
        <h2 className="text-sm font-bold text-[#231F20]/60 uppercase tracking-wide mb-3">Business Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatTile value={clientCount} label="Clients" />
          <StatTile value={activeProjectCount} label="Active Projects" />
          <StatTile value={taskCompletionRate !== null ? `${taskCompletionRate}%` : "—"} label="Tasks Completed" />
          <StatTile value={revenueThisMonth} label="Revenue This Month" color="#065F46" />
          <StatTile value={totalOutstanding} label="Outstanding" color="#92400E" />
          <StatTile value={dueFollowUps} label="Due for Follow-up" color="#92400E" />
        </div>
      </div>

      {/* Pipeline funnel */}
      <div>
        <h2 className="text-sm font-bold text-[#231F20]/60 uppercase tracking-wide mb-3">Pipeline ({total} leads)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {LEAD_STATUSES.map((status) => (
            <div key={status} className="bg-white rounded-2xl p-4 shadow-sm border border-[#1A14A5]/10">
              <p className="text-2xl font-extrabold" style={{ color: LEAD_STATUS_COLORS[status].text }}>
                {counts[status]}
              </p>
              <p className="text-xs text-[#231F20]/60 mt-1">{LEAD_STATUS_LABELS[status]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent leads */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1A14A5]/10 flex items-center justify-between">
          <h2 className="font-bold text-[#231F20]">Recent Leads</h2>
          <Link href="/admin/leads" className="text-sm font-medium text-[#1A14A5] hover:underline">
            View all →
          </Link>
        </div>
        <ul className="divide-y divide-[#1A14A5]/5">
          {recent.length === 0 && (
            <li className="px-6 py-8 text-center text-sm text-[#231F20]/50">No leads yet.</li>
          )}
          {recent.map((lead) => (
            <li key={lead.id}>
              <Link
                href={`/admin/leads/${lead.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-[#F4F7FE] transition"
              >
                <div>
                  <p className="font-medium text-[#231F20]">{lead.name}</p>
                  <p className="text-sm text-[#231F20]/50">
                    {lead.selected_service || lead.service_category || "—"} &middot; {lead.email}
                  </p>
                </div>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{
                    background: LEAD_STATUS_COLORS[lead.status as LeadStatus].bg,
                    color: LEAD_STATUS_COLORS[lead.status as LeadStatus].text,
                  }}
                >
                  {LEAD_STATUS_LABELS[lead.status as LeadStatus]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

import Link from "next/link";
import {
  AlertTriangle,
  Banknote,
  CalendarCheck,
  CheckSquare,
  Clock,
  Contact,
  FolderKanban,
  Receipt,
  TrendingUp,
  Users,
} from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  LEAD_STATUSES,
  LEAD_STATUS_COLORS,
  LEAD_STATUS_LABELS,
  formatBookingDateTime,
  type Lead,
  type LeadStatus,
} from "@/lib/leads";
import { formatMoney, type Currency } from "@/lib/invoices";
import { sumToPKR } from "@/lib/currency";
import { getExchangeRates } from "@/lib/admin/exchange-rates";
import { todayInPkt } from "@/lib/availability";
import {
  buildProfitLoss,
  currentMonthKey,
  monthEndExclusive,
  monthLabel,
  monthStartDate,
  percentChange,
  shiftMonth,
  type ExpenseRow,
  type PaymentRow,
} from "@/lib/finance";
import { Badge, EmptyState, PageHeader, SectionCard, StatCard } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

type PaymentJoin = {
  amount: number;
  paid_on: string;
  invoices:
    | { currency: Currency; client_id: string; project_id: string | null }
    | { currency: Currency; client_id: string; project_id: string | null }[]
    | null;
};

async function getDashboardData() {
  const supabase = createServiceRoleClient();

  // This month and the one before it, so every money tile can show its own
  // month-over-month movement. Bucketing is delegated to lib/finance, the
  // same code behind /admin/finance — the dashboard and the P&L report can't
  // drift apart.
  const thisMonth = currentMonthKey();
  const lastMonth = shiftMonth(thisMonth, -1);
  const windowStart = monthStartDate(lastMonth);
  const windowEnd = monthEndExclusive(thisMonth);

  const [
    { data: allLeads },
    { count: dueFollowUps },
    { count: clientCount },
    { count: activeProjectCount },
    { count: activeEmployeeCount },
    { count: upcomingBookingCount },
    { data: upcomingBookingsData },
    { data: tasksData },
    { data: paymentsData },
    { data: outstandingInvoices },
    { data: expensesData },
    rates,
  ] = await Promise.all([
    // Consultation bookings have their own dashboard widget below — kept
    // out of the pipeline funnel/recent list so the two lead types don't
    // get mixed, matching the split between /admin/leads and /admin/bookings.
    supabase
      .from("leads")
      .select("id, name, email, status, selected_service, service_category, created_at")
      .neq("source", "consultation_booking")
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
    supabase.from("employees").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("source", "consultation_booking")
      .eq("booking_status", "confirmed")
      .gte("booking_date", todayInPkt()),
    supabase
      .from("leads")
      .select("id, name, email, booking_date, booking_time, booking_status")
      .eq("source", "consultation_booking")
      .eq("booking_status", "confirmed")
      .gte("booking_date", todayInPkt())
      .order("booking_date")
      .order("booking_time")
      .limit(5),
    supabase.from("tasks").select("status"),
    supabase
      .from("payments")
      .select("amount, paid_on, invoices(currency, client_id, project_id)")
      .gte("paid_on", windowStart)
      .lt("paid_on", windowEnd),
    supabase.from("invoice_balances").select("balance, currency").in("status", ["sent", "partially_paid"]),
    supabase
      .from("expenses")
      .select("amount, expense_date, currency, category")
      .gte("expense_date", windowStart)
      .lt("expense_date", windowEnd),
    getExchangeRates(),
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

  const payments: PaymentRow[] = ((paymentsData ?? []) as PaymentJoin[]).map((row) => {
    const invoice = Array.isArray(row.invoices) ? row.invoices[0] : row.invoices;
    return {
      amount: Number(row.amount),
      paid_on: row.paid_on,
      currency: invoice?.currency ?? "PKR",
      client_id: invoice?.client_id ?? null,
      project_id: invoice?.project_id ?? null,
    };
  });
  const expenses = (expensesData ?? []) as ExpenseRow[];

  // KPIs show one converted PKR figure rather than "$500 + PKR 20,000" —
  // PKR is the business's standard currency; see lib/currency.ts and the
  // admin-editable rates at /admin/settings/exchange-rates. Individual
  // invoices/expenses/projects still keep and display their own real
  // currency — this conversion is only for these aggregate totals.
  const shared = { payments, invoices: [], expenses, rates, basis: "cash" as const };
  const current = buildProfitLoss({ from: thisMonth, to: thisMonth, ...shared }).totals;
  const previous = buildProfitLoss({ from: lastMonth, to: lastMonth, ...shared }).totals;

  const totalOutstanding = sumToPKR(
    (outstandingInvoices ?? []).map((i: { balance: number; currency: Currency | null }) => ({
      amount: i.balance,
      currency: i.currency ?? "PKR",
    })),
    rates
  );

  return {
    total: leads.length,
    counts,
    dueFollowUps: dueFollowUps ?? 0,
    clientCount: clientCount ?? 0,
    activeProjectCount: activeProjectCount ?? 0,
    activeEmployeeCount: activeEmployeeCount ?? 0,
    upcomingBookingCount: upcomingBookingCount ?? 0,
    upcomingBookings: (upcomingBookingsData ?? []) as Pick<
      Lead,
      "id" | "name" | "email" | "booking_date" | "booking_time" | "booking_status"
    >[],
    taskCompletionRate,
    current,
    previous,
    totalOutstanding,
    monthLabel: monthLabel(thisMonth, { withYear: true }),
    recent: leads.slice(0, 5),
  };
}

/** Month-over-month movement for a money tile. Expenses invert: spending less is the good direction. */
function monthDelta(current: number, previous: number, { invert = false } = {}) {
  const change = percentChange(current, previous);
  if (change === null) return undefined;
  const rising = change > 0;
  return {
    value: `${change > 0 ? "+" : ""}${change}%`,
    direction: (change === 0 ? "flat" : (invert ? !rising : rising) ? "up" : "down") as "up" | "down" | "flat",
    label: " vs last month",
  };
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle={`Pipeline, delivery and money at a glance · finances for ${data.monthLabel}`}
      />

      {/* Money — tiles link through to the P&L report they're drawn from. */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#231F20]/60">This month</h2>
          <Link href="/admin/finance" className="text-sm font-medium text-[#1A14A5] hover:underline">
            Full P&amp;L report →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Revenue"
            value={formatMoney(data.current.revenue, "PKR")}
            icon={Banknote}
            valueColor="#4338CA"
            iconBg="#5B4BE8"
            delta={monthDelta(data.current.revenue, data.previous.revenue)}
            description="Payments received"
            href="/admin/finance"
          />
          <StatCard
            label="Expenses"
            value={formatMoney(data.current.expenses, "PKR")}
            icon={Receipt}
            valueColor="#9F1239"
            iconBg="#E11D48"
            delta={monthDelta(data.current.expenses, data.previous.expenses, { invert: true })}
            description="Total spent"
            href="/admin/expenses"
          />
          <StatCard
            label="Profit"
            value={formatMoney(data.current.profit, "PKR")}
            icon={TrendingUp}
            valueColor={data.current.profit >= 0 ? "#0F766E" : "#B91C1C"}
            iconBg={data.current.profit >= 0 ? "#0D9488" : "#dc2626"}
            delta={monthDelta(data.current.profit, data.previous.profit)}
            description={data.current.margin !== null ? `${data.current.margin}% margin` : "No revenue yet"}
            href="/admin/finance"
          />
          <StatCard
            label="Outstanding"
            value={formatMoney(data.totalOutstanding, "PKR")}
            icon={AlertTriangle}
            valueColor="#92400E"
            iconBg="#f97316"
            description="Unpaid invoice balance"
            href="/admin/invoices"
          />
        </div>
      </section>

      {/* Operations */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[#231F20]/60">Business overview</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            label="Clients"
            value={data.clientCount}
            description="Total active clients"
            icon={Users}
            iconBg="#0d9488"
            href="/admin/clients"
          />
          <StatCard
            label="Active Projects"
            value={data.activeProjectCount}
            description="Projects in progress"
            icon={FolderKanban}
            iconBg="#1A14A5"
            href="/admin/projects"
          />
          <StatCard
            label="Team Members"
            value={data.activeEmployeeCount}
            description="Active employees"
            icon={Contact}
            iconBg="#7c3aed"
            href="/admin/employees"
          />
          <StatCard
            label="Upcoming Bookings"
            value={data.upcomingBookingCount}
            description="Confirmed consultations"
            icon={CalendarCheck}
            iconBg="#1A14A5"
            href="/admin/bookings"
          />
          <StatCard
            label="Tasks Completed"
            value={data.taskCompletionRate !== null ? `${data.taskCompletionRate}%` : "—"}
            description="Share of all tasks done"
            icon={CheckSquare}
            iconBg="#0d9488"
            href="/admin/tasks"
          />
        </div>
      </section>

      {/* Pipeline funnel */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#231F20]/60">
            Leads pipeline ({data.total})
          </h2>
          {data.dueFollowUps > 0 && (
            <Link
              href="/admin/leads"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:underline"
            >
              <Clock className="h-4 w-4" />
              {data.dueFollowUps} due for follow-up
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {LEAD_STATUSES.map((status) => (
            <Link
              key={status}
              href={`/admin/leads?status=${status}`}
              className="rounded-2xl border border-[#1A14A5]/10 bg-white p-4 shadow-sm transition hover:border-[#1A14A5]/30 hover:shadow-md"
            >
              <p className="text-2xl font-extrabold" style={{ color: LEAD_STATUS_COLORS[status].text }}>
                {data.counts[status]}
              </p>
              <p className="mt-1 text-xs text-[#231F20]/60">{LEAD_STATUS_LABELS[status]}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Recent leads"
          padded={false}
          action={
            <Link href="/admin/leads" className="text-sm font-medium text-[#1A14A5] hover:underline">
              View all →
            </Link>
          }
        >
          {data.recent.length === 0 ? (
            <EmptyState icon={Users} title="No leads yet" description="New enquiries from the site land here." />
          ) : (
            <ul className="divide-y divide-[#1A14A5]/5">
              {data.recent.map((lead) => (
                <li key={lead.id}>
                  <Link
                    href={`/admin/leads/${lead.id}`}
                    className="flex items-center justify-between gap-3 px-6 py-4 transition hover:bg-[#F4F7FE]"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#231F20]">{lead.name}</p>
                      <p className="truncate text-sm text-[#231F20]/50">
                        {lead.selected_service || lead.service_category || "—"} · {lead.email}
                      </p>
                    </div>
                    <Badge
                      label={LEAD_STATUS_LABELS[lead.status as LeadStatus]}
                      colors={LEAD_STATUS_COLORS[lead.status as LeadStatus]}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Upcoming bookings"
          padded={false}
          action={
            <Link href="/admin/bookings" className="text-sm font-medium text-[#1A14A5] hover:underline">
              View all →
            </Link>
          }
        >
          {data.upcomingBookings.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No upcoming bookings"
              description="Confirmed consultations will appear here."
            />
          ) : (
            <ul className="divide-y divide-[#1A14A5]/5">
              {data.upcomingBookings.map((booking) => (
                <li key={booking.id}>
                  <Link
                    href={`/admin/leads/${booking.id}`}
                    className="flex items-center justify-between gap-3 px-6 py-4 transition hover:bg-[#F4F7FE]"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#231F20]">{booking.name}</p>
                      <p className="truncate text-sm text-[#231F20]/50">{booking.email}</p>
                    </div>
                    <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-[#1A14A5]">
                      {formatBookingDateTime(booking)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

import Link from "next/link";
import {
  Users,
  FolderKanban,
  Contact,
  CalendarCheck,
  CheckSquare,
  TrendingUp,
  Receipt,
  AlertTriangle,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
  formatBookingDateTime,
  type Lead,
  type LeadStatus,
} from "@/lib/leads";
import { formatMoney, type Currency } from "@/lib/invoices";
import { sumToPKR } from "@/lib/currency";
import { getExchangeRates } from "@/lib/admin/exchange-rates";
import { todayInPkt } from "@/lib/availability";

export const dynamic = "force-dynamic";

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
    { count: activeEmployeeCount },
    { count: upcomingBookingCount },
    { data: upcomingBookingsData },
    { data: tasksData },
    { data: paymentsThisMonth },
    { data: outstandingInvoices },
    { data: expensesThisMonthData },
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
      .select("amount, invoices(currency)")
      .gte("paid_on", startOfMonth.toISOString().slice(0, 10)),
    supabase.from("invoice_balances").select("balance, currency").in("status", ["sent", "partially_paid"]),
    supabase
      .from("expenses")
      .select("amount, currency")
      .gte("expense_date", startOfMonth.toISOString().slice(0, 10)),
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

  // KPIs show one converted PKR figure rather than "$500 + PKR 20,000" —
  // PKR is the business's standard currency; see lib/currency.ts and the
  // admin-editable rates at /admin/settings/exchange-rates. Individual
  // invoices/expenses/projects still keep and display their own real
  // currency — this conversion is only for these aggregate totals.
  const revenueThisMonth = formatMoney(
    sumToPKR(
      (paymentsThisMonth ?? []).map((p: { amount: number; invoices: { currency: Currency } | { currency: Currency }[] | null }) => ({
        amount: p.amount,
        currency: (Array.isArray(p.invoices) ? p.invoices[0]?.currency : p.invoices?.currency) ?? "PKR",
      })),
      rates
    ),
    "PKR"
  );
  const totalOutstanding = formatMoney(
    sumToPKR(
      (outstandingInvoices ?? []).map((i: { balance: number; currency: Currency | null }) => ({
        amount: i.balance,
        currency: i.currency ?? "PKR",
      })),
      rates
    ),
    "PKR"
  );
  const expensesThisMonth = formatMoney(
    sumToPKR(
      (expensesThisMonthData ?? []).map((e: { amount: number; currency: Currency | null }) => ({
        amount: e.amount,
        currency: e.currency ?? "PKR",
      })),
      rates
    ),
    "PKR"
  );

  return {
    total: leads.length,
    counts,
    dueFollowUps: dueFollowUps ?? 0,
    clientCount: clientCount ?? 0,
    activeProjectCount: activeProjectCount ?? 0,
    activeEmployeeCount: activeEmployeeCount ?? 0,
    expensesThisMonth,
    upcomingBookingCount: upcomingBookingCount ?? 0,
    upcomingBookings: (upcomingBookingsData ?? []) as Pick<
      Lead,
      "id" | "name" | "email" | "booking_date" | "booking_time" | "booking_status"
    >[],
    taskCompletionRate,
    revenueThisMonth,
    totalOutstanding,
    recent: leads.slice(0, 5),
  };
}

interface StatTileProps {
  value: string | number;
  label: string;
  /** Small line under the value, e.g. "Total active clients" — layout modeled on a reference screenshot. */
  description: string;
  icon: LucideIcon;
  /** Value text color. */
  color?: string;
  /** Icon badge background — kept distinct per tile so the row scans at a glance, same idea as the reference's varied teal/orange/red/purple badges. */
  iconBg?: string;
}

function StatTile({ value, label, description, icon: Icon, color, iconBg }: StatTileProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#1A14A5]/10 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#231F20]/70 truncate">{label}</p>
        <p className="text-2xl font-extrabold mt-1 break-words" style={{ color: color || "#1A14A5" }}>
          {value}
        </p>
        <p className="text-xs text-[#231F20]/50 mt-1 truncate">{description}</p>
      </div>
      <div
        className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: iconBg || "#1A14A5" }}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
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
    activeEmployeeCount,
    expensesThisMonth,
    upcomingBookingCount,
    upcomingBookings,
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatTile
            value={clientCount}
            label="Clients"
            description="Total active clients"
            icon={Users}
            iconBg="#0d9488"
          />
          <StatTile
            value={activeProjectCount}
            label="Active Projects"
            description="Projects in progress"
            icon={FolderKanban}
            iconBg="#1A14A5"
          />
          <StatTile
            value={activeEmployeeCount}
            label="Team Members"
            description="Active employees"
            icon={Contact}
            iconBg="#7c3aed"
          />
          <StatTile
            value={upcomingBookingCount}
            label="Upcoming Bookings"
            description="Confirmed consultations"
            icon={CalendarCheck}
            color="#1A14A5"
            iconBg="#1A14A5"
          />
          <StatTile
            value={taskCompletionRate !== null ? `${taskCompletionRate}%` : "—"}
            label="Tasks Completed"
            description="Share of all tasks done"
            icon={CheckSquare}
            iconBg="#0d9488"
          />
          <StatTile
            value={revenueThisMonth}
            label="Revenue This Month"
            description="Payments received"
            icon={TrendingUp}
            color="#065F46"
            iconBg="#059669"
          />
          <StatTile
            value={expensesThisMonth}
            label="Expenses This Month"
            description="Total spent"
            icon={Receipt}
            color="#991B1B"
            iconBg="#dc2626"
          />
          <StatTile
            value={totalOutstanding}
            label="Outstanding"
            description="Unpaid invoice balance"
            icon={AlertTriangle}
            color="#92400E"
            iconBg="#f97316"
          />
          <StatTile
            value={dueFollowUps}
            label="Due for Follow-up"
            description="Leads needing contact"
            icon={Clock}
            color="#92400E"
            iconBg="#f97316"
          />
        </div>
      </div>

      {/* Pipeline funnel */}
      <div>
        <h2 className="text-sm font-bold text-[#231F20]/60 uppercase tracking-wide mb-3">Leads Pipeline ({total})</h2>
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

      <div className="grid lg:grid-cols-2 gap-6">
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

        {/* Upcoming bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1A14A5]/10 flex items-center justify-between">
            <h2 className="font-bold text-[#231F20]">Upcoming Bookings</h2>
            <Link href="/admin/bookings" className="text-sm font-medium text-[#1A14A5] hover:underline">
              View all →
            </Link>
          </div>
          <ul className="divide-y divide-[#1A14A5]/5">
            {upcomingBookings.length === 0 && (
              <li className="px-6 py-8 text-center text-sm text-[#231F20]/50">No upcoming bookings.</li>
            )}
            {upcomingBookings.map((booking) => (
              <li key={booking.id}>
                <Link
                  href={`/admin/leads/${booking.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-[#F4F7FE] transition gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[#231F20] truncate">{booking.name}</p>
                    <p className="text-sm text-[#231F20]/50 truncate">{booking.email}</p>
                  </div>
                  <span className="text-xs font-semibold text-[#1A14A5] whitespace-nowrap shrink-0">
                    {formatBookingDateTime(booking)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

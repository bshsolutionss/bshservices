import { Banknote, Percent, Receipt, TrendingUp } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getExchangeRates } from "@/lib/admin/exchange-rates";
import { formatMoney, type Currency } from "@/lib/invoices";
import { getOptions } from "@/lib/admin/options";
import type { Client } from "@/lib/clients";
import type { Project } from "@/lib/projects";
import {
  REVENUE_BASIS_LABELS,
  buildProfitLoss,
  monthEndExclusive,
  monthLabel,
  monthStartDate,
  percentChange,
  previousRange,
  resolveRange,
  type ExpenseRow,
  type InvoiceRow,
  type PaymentRow,
  type RevenueBasis,
} from "@/lib/finance";
import { Alert, PageHeader, SectionCard, StatCard } from "@/components/admin/ui";
import FinanceFilters from "@/components/admin/finance/FinanceFilters";
import ProfitLossChart from "@/components/admin/finance/ProfitLossChart";
import ProfitLossTable from "@/components/admin/finance/ProfitLossTable";
import BreakdownList from "@/components/admin/finance/BreakdownList";

export const dynamic = "force-dynamic";

/** Shape of a payment joined to its invoice — Supabase types the relation as object-or-array. */
type PaymentJoin = {
  amount: number;
  paid_on: string;
  invoices: { currency: Currency; client_id: string; project_id: string | null } | null | { currency: Currency; client_id: string; project_id: string | null }[];
};

function firstRelation<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

export default async function AdminFinancePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; preset?: string; basis?: string; category?: string; client?: string }>;
}) {
  const query = await searchParams;
  const { from, to, preset } = resolveRange(query);
  const basis: RevenueBasis = query.basis === "accrual" ? "accrual" : "cash";
  const category = query.category?.trim().slice(0, 80) ?? "";
  const clientFilter = query.client ?? "";

  const comparison = previousRange(from, to);
  // One fetch window covering both the selected range and the comparison
  // range, so the period-over-period deltas cost no extra round trips.
  const windowStart = monthStartDate(comparison.from);
  const windowEnd = monthEndExclusive(to);

  const supabase = createServiceRoleClient();

  const [{ data: paymentsData }, { data: expensesData }, { data: clientsData }, { data: projectsData }, rates] =
    await Promise.all([
      supabase
        .from("payments")
        .select("amount, paid_on, invoices(currency, client_id, project_id)")
        .gte("paid_on", windowStart)
        .lt("paid_on", windowEnd),
      supabase
        .from("expenses")
        .select("amount, expense_date, currency, category")
        .gte("expense_date", windowStart)
        .lt("expense_date", windowEnd),
      supabase.from("clients").select("id, company_name").order("company_name"),
      supabase.from("projects").select("id, name"),
      getExchangeRates(),
    ]);

  // `issue_date` arrives with migration 0010. Until it's applied, fall back to
  // created_at so the accrual view still reports rather than showing zeros.
  let invoices: InvoiceRow[] = [];
  const invoicesQuery = await supabase
    .from("invoices")
    .select("total, issue_date, currency, status, client_id, project_id")
    .gte("issue_date", windowStart)
    .lt("issue_date", windowEnd);

  if (invoicesQuery.error) {
    const { data: legacy } = await supabase
      .from("invoices")
      .select("total, created_at, currency, status, client_id, project_id")
      .gte("created_at", windowStart)
      .lt("created_at", windowEnd);
    invoices = ((legacy ?? []) as (Omit<InvoiceRow, "issue_date"> & { created_at: string })[]).map((row) => ({
      ...row,
      issue_date: row.created_at.slice(0, 10),
    }));
  } else {
    invoices = (invoicesQuery.data ?? []) as InvoiceRow[];
  }

  const payments: PaymentRow[] = ((paymentsData ?? []) as PaymentJoin[]).map((row) => {
    const invoice = firstRelation(row.invoices);
    return {
      amount: Number(row.amount),
      paid_on: row.paid_on,
      currency: invoice?.currency ?? "PKR",
      client_id: invoice?.client_id ?? null,
      project_id: invoice?.project_id ?? null,
    };
  });

  const expenses = (expensesData ?? []) as ExpenseRow[];
  const clients = (clientsData ?? []) as Pick<Client, "id" | "company_name">[];
  const projects = (projectsData ?? []) as Pick<Project, "id" | "name">[];
  const clientNames = new Map(clients.map((c) => [c.id, c.company_name]));
  const projectNames = new Map(projects.map((p) => [p.id, p.name]));

  const shared = { payments, invoices, expenses, rates, basis, category, clientId: clientFilter || undefined };
  const report = buildProfitLoss({ from, to, ...shared });
  const previous = buildProfitLoss({ from: comparison.from, to: comparison.to, ...shared });

  const deltaOf = (current: number, before: number, { invert = false } = {}) => {
    const change = percentChange(current, before);
    if (change === null) return undefined;
    const rising = change > 0;
    return {
      value: `${change > 0 ? "+" : ""}${change}%`,
      direction: (change === 0 ? "flat" : (invert ? !rising : rising) ? "up" : "down") as "up" | "down" | "flat",
      label: " vs previous period",
    };
  };

  const rangeTitle =
    from === to
      ? monthLabel(from, { withYear: true })
      : `${monthLabel(from, { withYear: true })} – ${monthLabel(to, { withYear: true })}`;

  const expenseBreakdown = report.expensesByCategory.map((row) => ({
    label: row.category,
    amount: row.amount,
    share: row.share,
  }));

  const revenueTotal = report.totals.revenue || 1;
  const clientBreakdown = report.revenueByClient.slice(0, 6).map((row) => ({
    label: clientNames.get(row.id) ?? "Unknown client",
    amount: row.amount,
    share: Math.round((row.amount / revenueTotal) * 1000) / 10,
  }));
  const projectBreakdown = report.revenueByProject.slice(0, 6).map((row) => ({
    label: projectNames.get(row.id) ?? "Unknown project",
    amount: row.amount,
    share: Math.round((row.amount / revenueTotal) * 1000) / 10,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profit & Loss"
        subtitle={`Profit and loss for ${rangeTitle} · ${report.months.length} month${report.months.length === 1 ? "" : "s"} · ${
          REVENUE_BASIS_LABELS[basis]
        }`}
      />

      <FinanceFilters
        from={from}
        to={to}
        preset={preset}
        basis={basis}
        category={category}
        clientId={clientFilter}
        categories={(await getOptions("expense_categories")).map((o) => o.value)}
        clients={clients.map((c) => ({ id: c.id, name: c.company_name }))}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Revenue"
          value={formatMoney(report.totals.revenue, "PKR")}
          icon={Banknote}
          valueColor="#4338CA"
          iconBg="#5B4BE8"
          delta={deltaOf(report.totals.revenue, previous.totals.revenue)}
          description={`Avg ${formatMoney(report.totals.averageRevenue, "PKR")}/mo`}
        />
        <StatCard
          label="Expenses"
          value={formatMoney(report.totals.expenses, "PKR")}
          icon={Receipt}
          valueColor="#9F1239"
          iconBg="#E11D48"
          delta={deltaOf(report.totals.expenses, previous.totals.expenses, { invert: true })}
          description={`Avg ${formatMoney(report.totals.averageExpenses, "PKR")}/mo`}
        />
        <StatCard
          label="Net profit"
          value={formatMoney(report.totals.profit, "PKR")}
          icon={TrendingUp}
          valueColor={report.totals.profit >= 0 ? "#0F766E" : "#B91C1C"}
          iconBg={report.totals.profit >= 0 ? "#0D9488" : "#dc2626"}
          delta={deltaOf(report.totals.profit, previous.totals.profit)}
          description={`Avg ${formatMoney(report.totals.averageProfit, "PKR")}/mo`}
        />
        <StatCard
          label="Margin"
          value={report.totals.margin !== null ? `${report.totals.margin}%` : "—"}
          icon={Percent}
          valueColor="#1A14A5"
          iconBg="#1A14A5"
          description={
            report.best
              ? `Best month: ${report.best.label} (${formatMoney(report.best.profit, "PKR")})`
              : "No data in range"
          }
        />
      </div>

      {report.totals.revenue === 0 && report.totals.expenses === 0 ? (
        <Alert tone="info" title="Nothing recorded in this period">
          No {basis === "cash" ? "payments" : "sent invoices"} or expenses fall inside {rangeTitle}. Widen the period,
          or record a payment against an invoice to see it here.
        </Alert>
      ) : (
        <>
          <SectionCard title="Month by month" subtitle="Revenue against expenses, with profit over the top">
            <ProfitLossChart months={report.months} />
          </SectionCard>

          <SectionCard title="Breakdown" padded={false} bodyClassName="px-5 py-5 sm:px-6">
            <ProfitLossTable
              months={report.months}
              totals={report.totals}
              rangeId={`${from}_${to}`}
              basisLabel={REVENUE_BASIS_LABELS[basis]}
            />
          </SectionCard>

          <div className="grid gap-6 lg:grid-cols-3">
            <SectionCard
              title="Expenses by category"
              subtitle={category ? `Filtered to ${category}` : "Where the money went"}
            >
              <BreakdownList items={expenseBreakdown} emptyMessage="No expenses in this period." />
            </SectionCard>
            <SectionCard title="Revenue by client" subtitle="Top 6 in this period">
              <BreakdownList items={clientBreakdown} emptyMessage="No revenue attributed to a client." />
            </SectionCard>
            <SectionCard title="Revenue by project" subtitle="Top 6 in this period">
              <BreakdownList
                items={projectBreakdown}
                emptyMessage="No revenue linked to a project — link invoices to projects to see this."
              />
            </SectionCard>
          </div>

          {report.emptyMonths.length > 0 && (
            <p className="px-1 text-xs text-[#231F20]/45">
              {report.emptyMonths.length} month{report.emptyMonths.length === 1 ? "" : "s"} in this range recorded no
              revenue and no expenses, and show as zero rather than being skipped.
            </p>
          )}
        </>
      )}
    </div>
  );
}

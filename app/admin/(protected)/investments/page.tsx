import { Coins, LineChart, PiggyBank, TrendingUp } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getExchangeRates } from "@/lib/admin/exchange-rates";
import { getCompanySettings } from "@/lib/admin/company-settings";
import { sumToPKR } from "@/lib/currency";
import { formatMoney } from "@/lib/invoices";
import type { Investment, InvestmentReturn } from "@/lib/investments";
import { PageHeader, StatCard } from "@/components/admin/ui";
import InvestmentFormModal from "@/components/admin/investments/InvestmentFormModal";
import InvestmentsTable, { type InvestmentRow } from "@/components/admin/investments/InvestmentsTable";

export const dynamic = "force-dynamic";

export default async function AdminInvestmentsPage() {
  const supabase = createServiceRoleClient();
  const [{ data: invData }, { data: retData }, rates, company] = await Promise.all([
    supabase.from("investments").select("*").order("invested_on", { ascending: false }),
    supabase.from("investment_returns").select("investment_id, amount"),
    getExchangeRates(),
    getCompanySettings(),
  ]);

  const returnsBy = new Map<string, number>();
  for (const r of (retData ?? []) as Pick<InvestmentReturn, "investment_id" | "amount">[]) {
    returnsBy.set(r.investment_id, (returnsBy.get(r.investment_id) ?? 0) + Number(r.amount));
  }
  const rows: InvestmentRow[] = ((invData ?? []) as Investment[]).map((i) => ({ ...i, returnsTotal: returnsBy.get(i.id) ?? 0 }));

  // Portfolio totals use the open positions only, converted to PKR so mixed currencies can be added.
  const open = rows.filter((r) => r.status === "active");
  const invested = sumToPKR(open.map((r) => ({ amount: Number(r.invested_amount), currency: r.currency })), rates);
  const value = sumToPKR(open.map((r) => ({ amount: Number(r.current_value), currency: r.currency })), rates);
  const income = sumToPKR(rows.map((r) => ({ amount: r.returnsTotal, currency: r.currency })), rates);
  const gain = value - invested;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Investments"
        subtitle={`${rows.length} investment${rows.length === 1 ? "" : "s"} · ${open.length} active · totals in PKR`}
        actions={<InvestmentFormModal defaultCurrency={company.default_currency} />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Invested" value={formatMoney(invested, "PKR")} icon={PiggyBank} iconBg="#1A14A5" description="Active investments" />
        <StatCard label="Current value" value={formatMoney(value, "PKR")} icon={LineChart} iconBg="#7c3aed" description="What they are worth now" />
        <StatCard
          label="Unrealised gain"
          value={`${gain >= 0 ? "+" : ""}${formatMoney(gain, "PKR")}`}
          icon={TrendingUp}
          valueColor={gain >= 0 ? "#0F766E" : "#B91C1C"}
          iconBg={gain >= 0 ? "#0D9488" : "#dc2626"}
          description={invested > 0 ? `${Math.round((gain / invested) * 1000) / 10}% on invested` : "Add an investment"}
        />
        <StatCard label="Income received" value={formatMoney(income, "PKR")} icon={Coins} iconBg="#f97316" description="Dividends, rent, profit share" />
      </div>

      <InvestmentsTable investments={rows} />
    </div>
  );
}

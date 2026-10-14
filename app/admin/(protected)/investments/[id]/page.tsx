import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  INVESTMENT_STATUS_COLORS,
  INVESTMENT_STATUS_LABELS,
  investmentPerformance,
  type Investment,
  type InvestmentReturn,
} from "@/lib/investments";
import { formatDate, formatMoney } from "@/lib/invoices";
import { Badge, PageHeader, SectionCard, StatCard } from "@/components/admin/ui";
import InvestmentFormModal from "@/components/admin/investments/InvestmentFormModal";
import InvestmentReturns from "@/components/admin/investments/InvestmentReturns";
import DeleteEntityButton from "@/components/admin/DeleteEntityButton";

export const dynamic = "force-dynamic";

export default async function AdminInvestmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceRoleClient();

  const [{ data: investment }, { data: returnsData }] = await Promise.all([
    supabase.from("investments").select("*").eq("id", id).single<Investment>(),
    supabase.from("investment_returns").select("*").eq("investment_id", id).order("received_on", { ascending: false }),
  ]);
  if (!investment) notFound();

  const returns = (returnsData ?? []) as InvestmentReturn[];
  const returnsTotal = returns.reduce((sum, r) => sum + Number(r.amount), 0);
  const { gain, roiPct } = investmentPerformance(investment, returnsTotal);
  const c = investment.currency;

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/admin/investments"
        backLabel="Investments"
        title={
          <span className="flex flex-wrap items-center gap-3">
            {investment.name}
            <Badge label={INVESTMENT_STATUS_LABELS[investment.status]} colors={INVESTMENT_STATUS_COLORS[investment.status]} />
          </span>
        }
        subtitle={`${investment.investment_type ?? "Investment"} · since ${formatDate(investment.invested_on)}`}
        actions={<InvestmentFormModal investment={investment} />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Invested" value={formatMoney(investment.invested_amount, c)} iconBg="#1A14A5" />
        <StatCard label="Current value" value={formatMoney(investment.current_value, c)} iconBg="#7c3aed" />
        <StatCard label="Returns received" value={formatMoney(returnsTotal, c)} iconBg="#f97316" />
        <StatCard
          label="Total gain / loss"
          value={`${gain >= 0 ? "+" : ""}${formatMoney(gain, c)}`}
          valueColor={gain >= 0 ? "#0F766E" : "#B91C1C"}
          description={roiPct !== null ? `${roiPct}% ROI${investment.expected_return_pct != null ? ` · expected ${investment.expected_return_pct}%/yr` : ""}` : undefined}
          iconBg="#0D9488"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Returns received" subtitle="Dividends, rent, profit share, sale proceeds">
            <InvestmentReturns investmentId={investment.id} currency={c} returns={returns} />
          </SectionCard>
        </div>
        <div className="space-y-6">
          {investment.notes && (
            <SectionCard title="Notes">
              <p className="whitespace-pre-wrap text-sm text-[#231F20]/75">{investment.notes}</p>
            </SectionCard>
          )}
          <DeleteEntityButton
            endpoint={`/api/admin/investments/${investment.id}`}
            redirectTo="/admin/investments"
            label="Delete investment"
            title="Delete this investment?"
            message="The investment and all its recorded returns are removed. This cannot be undone. If it is simply finished, set its status to Closed instead."
          />
        </div>
      </div>
    </div>
  );
}

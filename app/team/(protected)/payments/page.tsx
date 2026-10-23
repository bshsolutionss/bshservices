import { Wallet } from "lucide-react";
import { getTeamSession } from "@/lib/team/session";
import { getEarnings } from "@/lib/team/earnings";
import { formatDate, formatMoney } from "@/lib/invoices";
import { EmptyState, PageHeader, SectionLabel, StatCard, portalCard } from "@/components/portal/ui";
import { Clock, TrendingUp } from "lucide-react";

export default async function TeamPaymentsPage() {
  const session = (await getTeamSession())!;
  const e = await getEarnings(session.employeeId);

  return (
    <div>
      <PageHeader icon={Wallet} title="Payments" subtitle="What the agency has paid you." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={TrendingUp} value={formatMoney(e.thisMonth, "PKR")} label="Paid this month" tone="orange" />
        <StatCard icon={Wallet} value={formatMoney(e.total, "PKR")} label="Total received" />
        <StatCard icon={Clock} value={formatMoney(e.pending, "PKR")} label="Salary pending this month" hint={e.salary ? `Monthly salary ${formatMoney(e.salary.amount, e.salary.currency)}` : "Not on a monthly salary"} />
        <StatCard icon={Wallet} value={e.last ? formatDate(e.last.date) : "None yet"} label="Last payment" />
      </div>
      <SectionLabel>Payment history</SectionLabel>
      {e.payouts.length === 0 ? (
        <EmptyState icon={Wallet} title="No payments yet" description="Payments recorded for you will appear here." />
      ) : (
        <div className={`${portalCard} divide-y divide-stone-100 overflow-hidden`}>
          {e.payouts.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-stone-500">
                  {formatDate(p.date)}
                  {p.project && ` · ${p.project}`}
                </p>
              </div>
              <p className="font-semibold text-emerald-600">{formatMoney(p.amount, p.currency)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

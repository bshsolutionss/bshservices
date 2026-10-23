import { Download, Wallet, Receipt } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getPortalSession } from "@/lib/portal/session";
import { getClientBalances } from "@/lib/portal/data";
import { fiscalYearStart, moneyByCurrency } from "@/lib/portal/format";
import { formatDate, formatMoney, type Currency } from "@/lib/invoices";
import { EmptyState, PageHeader, SectionLabel, portalCard } from "@/components/portal/ui";
import { InvoiceRows } from "@/components/portal/lists";

export default async function PortalBillingPage() {
  const session = (await getPortalSession())!;
  const balances = await getClientBalances(session.clientId);
  const ids = balances.map((b) => b.invoice_id);
  const { data: payments } = ids.length
    ? await createServiceRoleClient().from("payments").select("id, invoice_id, amount, paid_on, method, reference").in("invoice_id", ids).order("paid_on", { ascending: false })
    : { data: [] as { id: string; invoice_id: string; amount: number; paid_on: string; method: string | null; reference: string | null }[] };

  const byInvoice = new Map(balances.map((b) => [b.invoice_id, b]));
  const outstanding = moneyByCurrency(balances.filter((b) => b.balance > 0.005).map((b) => ({ amount: Number(b.balance), currency: b.currency })));
  const paid = moneyByCurrency((payments ?? []).map((p) => ({ amount: Number(p.amount), currency: byInvoice.get(p.invoice_id)?.currency ?? "PKR" })));
  const hasOutstanding = balances.some((b) => b.balance > 0.005);

  const fyStart = fiscalYearStart().getUTCFullYear();
  const years = [fyStart, fyStart - 1];

  return (
    <div>
      <PageHeader icon={Wallet} title="Billing" subtitle="Invoices, payments and statements." />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className={`${portalCard} p-5`}>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400">Outstanding</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{hasOutstanding ? outstanding : formatMoney(0, "PKR")}</p>
          <p className="mt-1 text-sm text-stone-500">{hasOutstanding ? "Please settle by the due date." : "Everything is settled."}</p>
        </div>
        <div className={`${portalCard} p-5`}>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400">Total paid</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{paid}</p>
          <p className="mt-1 text-sm text-stone-500">Across all invoices</p>
        </div>
      </div>

      <SectionLabel>Invoices</SectionLabel>
      <InvoiceRows rows={balances} />

      <SectionLabel>Payments made</SectionLabel>
      {(payments ?? []).length === 0 ? (
        <EmptyState icon={Receipt} title="No payments yet" />
      ) : (
        <div className={`${portalCard} divide-y divide-stone-100 overflow-hidden`}>
          {(payments ?? []).map((p) => {
            const inv = byInvoice.get(p.invoice_id);
            return (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-medium">{inv?.invoice_number ?? "Invoice"}</p>
                  <p className="text-xs capitalize text-stone-500">
                    {formatDate(p.paid_on)}
                    {p.method && ` · ${p.method.replace(/_/g, " ")}`}
                    {p.reference && ` · ref ${p.reference}`}
                  </p>
                </div>
                <p className="font-semibold text-emerald-600">{formatMoney(Number(p.amount), (inv?.currency ?? "PKR") as Currency)}</p>
              </div>
            );
          })}
        </div>
      )}

      <SectionLabel>Annual statement</SectionLabel>
      <div className={`${portalCard} p-5`}>
        <p className="font-semibold">Statement of account</p>
        <p className="mt-0.5 text-sm text-stone-500">Everything you paid in a financial year (July - June), as a spreadsheet.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {years.map((y) => (
            <a key={y} href={`/api/portal/statement?year=${y}`} className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
              <Download className="h-4 w-4" />
              FY {y}-{String(y + 1).slice(2)}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS, formatMoney, type InvoiceBalance } from "@/lib/invoices";
import { sumToPKR } from "@/lib/currency";
import { getExchangeRates } from "@/lib/admin/exchange-rates";
import type { Client } from "@/lib/clients";
import type { Project } from "@/lib/projects";
import NewInvoiceInlineForm from "@/components/admin/NewInvoiceInlineForm";

export const dynamic = "force-dynamic";

export default async function AdminInvoicesPage() {
  const supabase = createServiceRoleClient();

  const [{ data: balancesData }, { data: clientsData }, { data: projectsData }, rates] = await Promise.all([
    supabase.from("invoice_balances").select("*").order("due_date", { ascending: true, nullsFirst: false }),
    supabase.from("clients").select("id, company_name").order("company_name"),
    supabase.from("projects").select("id, name, client_id"),
    getExchangeRates(),
  ]);

  const balances = (balancesData ?? []) as InvoiceBalance[];
  const clients = (clientsData ?? []) as Pick<Client, "id" | "company_name">[];
  const projects = (projectsData ?? []) as Pick<Project, "id" | "name" | "client_id">[];
  const clientNames = new Map(clients.map((c) => [c.id, c.company_name]));

  // invoice_balances doesn't carry invoice_number — join it in from the invoices table.
  const { data: invoicesData } = await supabase.from("invoices").select("id, invoice_number");
  const invoiceNumbers = new Map((invoicesData ?? []).map((i: { id: string; invoice_number: string }) => [i.id, i.invoice_number]));

  // PKR is the business's standard currency — see the note on the dashboard's KPIs.
  // Individual invoices below still show their own real currency.
  const outstandingTotalPKR = sumToPKR(
    balances
      .filter((b) => b.status === "sent" || b.status === "partially_paid")
      .map((b) => ({ amount: Number(b.balance), currency: b.currency })),
    rates
  );
  const outstandingSummary = outstandingTotalPKR > 0 ? formatMoney(outstandingTotalPKR, "PKR") : "";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#231F20]">Invoices</h1>
          <p className="text-[#231F20]/60 text-sm mt-1">
            {balances.length} invoice{balances.length === 1 ? "" : "s"}
            {outstandingSummary && <> &middot; {outstandingSummary} outstanding</>}
          </p>
        </div>
        <NewInvoiceInlineForm clients={clients} projects={projects} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1A14A5]/10 text-left text-[#231F20]/50">
              <th className="px-6 py-3 font-medium">Invoice</th>
              <th className="px-6 py-3 font-medium">Client</th>
              <th className="px-6 py-3 font-medium">Total</th>
              <th className="px-6 py-3 font-medium">Balance</th>
              <th className="px-6 py-3 font-medium">Due</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A14A5]/5">
            {balances.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-[#231F20]/50">
                  No invoices yet.
                </td>
              </tr>
            )}
            {balances.map((invoice) => (
              <tr key={invoice.invoice_id} className="hover:bg-[#F4F7FE] transition">
                <td className="px-6 py-4">
                  <Link href={`/admin/invoices/${invoice.invoice_id}`} className="font-medium text-[#1A14A5] hover:underline">
                    {invoiceNumbers.get(invoice.invoice_id) || invoice.invoice_id}
                  </Link>
                </td>
                <td className="px-6 py-4 text-[#231F20]/70">{clientNames.get(invoice.client_id) || "—"}</td>
                <td className="px-6 py-4 text-[#231F20]/70">{formatMoney(invoice.total, invoice.currency)}</td>
                <td className="px-6 py-4 text-[#231F20]/70">{formatMoney(invoice.balance, invoice.currency)}</td>
                <td className="px-6 py-4 text-xs whitespace-nowrap">
                  <span className={invoice.is_overdue ? "text-red-600 font-semibold" : "text-[#231F20]/50"}>
                    {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "—"}
                    {invoice.is_overdue ? " (overdue)" : ""}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{
                      background: INVOICE_STATUS_COLORS[invoice.status].bg,
                      color: INVOICE_STATUS_COLORS[invoice.status].text,
                    }}
                  >
                    {INVOICE_STATUS_LABELS[invoice.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

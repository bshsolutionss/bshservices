import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { Client } from "@/lib/clients";
import {
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
  formatMoney,
  type Invoice,
  type InvoiceBalance,
  type Payment,
  type PaymentMethod,
} from "@/lib/invoices";
import { Button } from "@/components/ui/button";
import MarkSentButton from "@/components/admin/MarkSentButton";
import RecordPaymentForm from "@/components/admin/RecordPaymentForm";
import ActivityTimeline from "@/components/admin/ActivityTimeline";
import InvoiceEditControl from "@/components/admin/InvoiceEditControl";
import DeleteInvoiceButton from "@/components/admin/DeleteInvoiceButton";
import DeletePaymentButton from "@/components/admin/DeletePaymentButton";

export const dynamic = "force-dynamic";

export default async function AdminInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceRoleClient();

  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", id).single<Invoice>();
  if (!invoice) {
    notFound();
  }

  const [{ data: client }, { data: balance }, { data: paymentsData }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", invoice.client_id).single<Client>(),
    supabase.from("invoice_balances").select("*").eq("invoice_id", id).single<InvoiceBalance>(),
    supabase.from("payments").select("*").eq("invoice_id", id).order("paid_on", { ascending: false }),
  ]);

  const payments = (paymentsData ?? []) as Payment[];
  const remainingBalance = balance ? Number(balance.balance) : Number(invoice.total);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/invoices" className="text-sm text-[#1A14A5] hover:underline">
          ← Back to Invoices
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-2xl font-extrabold text-[#231F20]">{invoice.invoice_number}</h1>
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{
              background: INVOICE_STATUS_COLORS[invoice.status].bg,
              color: INVOICE_STATUS_COLORS[invoice.status].text,
            }}
          >
            {INVOICE_STATUS_LABELS[invoice.status]}
          </span>
        </div>
        {client && (
          <Link href={`/admin/clients/${client.id}`} className="text-sm text-[#1A14A5] hover:underline">
            {client.company_name}
          </Link>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 p-6">
            <h2 className="font-bold text-[#231F20] mb-4">Invoice Details</h2>
            <InvoiceEditControl
              invoiceId={invoice.id}
              initialAmount={invoice.amount}
              initialTax={invoice.tax}
              initialDiscount={invoice.discount}
              initialCurrency={invoice.currency}
              initialDueDate={invoice.due_date}
              initialNotes={invoice.notes}
              hasPayments={payments.length > 0}
            />
            <dl className="grid sm:grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-[#1A14A5]/10">
              <div>
                <dt className="text-xs font-medium text-[#231F20]/50 uppercase tracking-wide">Total</dt>
                <dd className="text-[#231F20] font-bold mt-0.5">{formatMoney(invoice.total, invoice.currency)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[#231F20]/50 uppercase tracking-wide">Balance Due</dt>
                <dd className="text-[#231F20] font-bold mt-0.5">{formatMoney(remainingBalance, invoice.currency)}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 p-6">
            <h2 className="font-bold text-[#231F20] mb-4">Payments</h2>
            {payments.length === 0 ? (
              <p className="text-sm text-[#231F20]/50 mb-4">No payments recorded yet.</p>
            ) : (
              <ul className="divide-y divide-[#1A14A5]/5 mb-4">
                {payments.map((payment) => (
                  <li key={payment.id} className="py-2.5 flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium text-[#231F20]">{formatMoney(payment.amount, invoice.currency)}</span>
                      <span className="text-[#231F20]/50">
                        {" "}
                        — {payment.method ? PAYMENT_METHOD_LABELS[payment.method as PaymentMethod] : "—"}
                        {payment.reference ? ` (${payment.reference})` : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#231F20]/40">{new Date(payment.paid_on).toLocaleDateString()}</span>
                      <DeletePaymentButton invoiceId={invoice.id} paymentId={payment.id} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <RecordPaymentForm invoiceId={invoice.id} remainingBalance={remainingBalance} currency={invoice.currency} />
          </div>

          <ActivityTimeline entityType="invoice" entityId={invoice.id} />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 p-6 space-y-3">
            <h2 className="font-bold text-[#231F20] mb-1">Actions</h2>
            <Button asChild className="w-full bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-xl">
              <a href={`/api/admin/invoices/${invoice.id}/pdf`} target="_blank" rel="noopener noreferrer">
                Download PDF
              </a>
            </Button>
            {invoice.status === "draft" && <MarkSentButton invoiceId={invoice.id} />}
          </div>

          <DeleteInvoiceButton invoiceId={invoice.id} paymentCount={payments.length} />
        </div>
      </div>
    </div>
  );
}

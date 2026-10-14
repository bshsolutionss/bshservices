import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, FolderKanban } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { Client } from "@/lib/clients";
import type { Project } from "@/lib/projects";
import {
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  formatDate,
  formatMoney,
  type Invoice,
  type InvoiceBalance,
  type InvoiceItem,
  type Payment,
  type PaymentMethod,
} from "@/lib/invoices";
import { Alert, Badge, PageHeader, SectionCard, btnSecondary } from "@/components/admin/ui";
import MarkSentButton from "@/components/admin/MarkSentButton";
import RecordPaymentForm from "@/components/admin/RecordPaymentForm";
import ActivityTimeline from "@/components/admin/ActivityTimeline";
import DeleteInvoiceButton from "@/components/admin/DeleteInvoiceButton";
import DeletePaymentButton from "@/components/admin/DeletePaymentButton";
import InvoiceFlow from "@/components/admin/invoices/InvoiceFlow";
import InvoiceItemsEditor from "@/components/admin/invoices/InvoiceItemsEditor";
import InvoiceDetailsEditor from "@/components/admin/invoices/InvoiceDetailsEditor";

export const dynamic = "force-dynamic";

export default async function AdminInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceRoleClient();

  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", id).single<Invoice>();
  if (!invoice) {
    notFound();
  }

  const [{ data: client }, { data: balance }, { data: paymentsData }, { data: itemsData }, { data: projectsData }] =
    await Promise.all([
      supabase.from("clients").select("*").eq("id", invoice.client_id).single<Client>(),
      supabase.from("invoice_balances").select("*").eq("invoice_id", id).single<InvoiceBalance>(),
      supabase.from("payments").select("*").eq("invoice_id", id).order("paid_on", { ascending: false }),
      // Returns null (→ []) rather than throwing if migration 0010 hasn't
      // been applied yet, so the page still renders in that window.
      supabase.from("invoice_items").select("*").eq("invoice_id", id).order("position"),
      supabase.from("projects").select("id, name").eq("client_id", invoice.client_id).order("name"),
    ]);

  const payments = (paymentsData ?? []) as Payment[];
  const items = (itemsData ?? []) as InvoiceItem[];
  const projects = (projectsData ?? []) as Pick<Project, "id" | "name">[];
  const paid = balance ? Number(balance.paid) : 0;
  const remainingBalance = balance ? Number(balance.balance) : Number(invoice.total);
  const statusColors = INVOICE_STATUS_COLORS[invoice.status];

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/admin/invoices"
        backLabel="Invoices"
        title={
          <span className="flex flex-wrap items-center gap-3">
            {invoice.invoice_number}
            <Badge label={INVOICE_STATUS_LABELS[invoice.status]} colors={statusColors} />
            {balance?.is_overdue && <Badge label="Overdue" colors={{ bg: "#FEE2E2", text: "#991B1B" }} />}
          </span>
        }
        subtitle={
          <>
            {formatMoney(invoice.total, invoice.currency)} ·{" "}
            {client ? (
              <Link href={`/admin/clients/${client.id}`} className="font-medium text-[#1A14A5] hover:underline">
                {client.company_name}
              </Link>
            ) : (
              "Client removed"
            )}
            {invoice.project_id && (
              <>
                {" · "}
                <Link
                  href={`/admin/projects/${invoice.project_id}`}
                  className="inline-flex items-center gap-1 font-medium text-[#1A14A5] hover:underline"
                >
                  <FolderKanban className="h-3.5 w-3.5" />
                  {projects.find((p) => p.id === invoice.project_id)?.name ?? "Project"}
                </Link>
              </>
            )}
          </>
        }
        actions={
          <>
            <a
              href={`/api/admin/invoices/${invoice.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className={btnSecondary}
            >
              <Download className="h-4 w-4" /> PDF
            </a>
            {invoice.status === "draft" && <MarkSentButton invoiceId={invoice.id} />}
          </>
        }
      />

      <InvoiceFlow
        status={invoice.status}
        issueDate={invoice.issue_date ?? invoice.created_at}
        dueDate={invoice.due_date}
        total={Number(invoice.total)}
        paid={paid}
        currency={invoice.currency}
        lastPaymentOn={balance?.last_payment_on ?? null}
        isOverdue={!!balance?.is_overdue}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard
            title="Invoice contents"
            subtitle={
              items.length > 0
                ? `${items.length} line item${items.length === 1 ? "" : "s"} · totals are calculated from these`
                : "Billed as a single amount"
            }
          >
            <InvoiceItemsEditor
              invoiceId={invoice.id}
              currency={invoice.currency}
              items={items}
              taxRate={Number(invoice.tax_rate ?? 0)}
              tax={Number(invoice.tax)}
              discount={Number(invoice.discount)}
              amount={Number(invoice.amount)}
              hasPayments={payments.length > 0}
            />
          </SectionCard>

          <SectionCard
            title="Payments"
            subtitle={`${formatMoney(paid, invoice.currency)} received · ${formatMoney(
              remainingBalance,
              invoice.currency
            )} outstanding`}
          >
            {invoice.status === "draft" ? (
              <Alert tone="info" title="Send it first">
                This invoice is still a draft. Mark it as sent before recording payments, so the paid/unpaid figures in
                reports only count invoices the client has actually received.
              </Alert>
            ) : (
              <div className="space-y-5">
                {payments.length > 0 && (
                  <ul className="divide-y divide-[#1A14A5]/5">
                    {payments.map((payment) => (
                      <li key={payment.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                        <div className="min-w-0">
                          <span className="font-semibold text-[#231F20]">
                            {formatMoney(payment.amount, invoice.currency)}
                          </span>
                          <span className="text-[#231F20]/50">
                            {" · "}
                            {payment.method ? PAYMENT_METHOD_LABELS[payment.method as PaymentMethod] : "Method not set"}
                            {payment.reference ? ` (${payment.reference})` : ""}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="text-xs text-[#231F20]/40">{formatDate(payment.paid_on)}</span>
                          <DeletePaymentButton invoiceId={invoice.id} paymentId={payment.id} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <div className={payments.length > 0 ? "border-t border-[#1A14A5]/10 pt-5" : ""}>
                  <RecordPaymentForm
                    invoiceId={invoice.id}
                    remainingBalance={remainingBalance}
                    currency={invoice.currency}
                  />
                </div>
              </div>
            )}
          </SectionCard>

          <ActivityTimeline entityType="invoice" entityId={invoice.id} />
        </div>

        <div className="space-y-6">
          <SectionCard title="Details">
            <InvoiceDetailsEditor
              invoiceId={invoice.id}
              currency={invoice.currency}
              issueDate={invoice.issue_date ?? invoice.created_at.slice(0, 10)}
              dueDate={invoice.due_date}
              notes={invoice.notes}
              projectId={invoice.project_id}
              projects={projects}
              itemised={items.length > 0}
              amount={Number(invoice.amount)}
              tax={Number(invoice.tax)}
              taxRate={Number(invoice.tax_rate ?? 0)}
            />
          </SectionCard>

          <SectionCard title="Totals">
            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-[#231F20]/55">Subtotal</dt>
                <dd className="font-semibold text-[#231F20]">{formatMoney(invoice.amount, invoice.currency)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[#231F20]/55">
                  Tax {Number(invoice.tax_rate) > 0 ? `(${Number(invoice.tax_rate)}%)` : ""}
                </dt>
                <dd className="font-semibold text-[#231F20]">{formatMoney(invoice.tax, invoice.currency)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[#231F20]/55">Discount</dt>
                <dd className="font-semibold text-[#231F20]">−{formatMoney(invoice.discount, invoice.currency)}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-[#1A14A5]/10 pt-2">
                <dt className="font-bold text-[#231F20]">Total</dt>
                <dd className="font-extrabold text-[#1A14A5]">{formatMoney(invoice.total, invoice.currency)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[#231F20]/55">Paid</dt>
                <dd className="font-semibold text-emerald-700">{formatMoney(paid, invoice.currency)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-bold text-[#231F20]">Balance due</dt>
                <dd className="font-extrabold text-[#231F20]">{formatMoney(remainingBalance, invoice.currency)}</dd>
              </div>
            </dl>
          </SectionCard>

          <DeleteInvoiceButton invoiceId={invoice.id} paymentCount={payments.length} />
        </div>
      </div>
    </div>
  );
}

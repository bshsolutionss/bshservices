import type { SupabaseClient } from "@supabase/supabase-js";
import type { InvoiceBalance } from "@/lib/invoices";

/**
 * Re-derives an invoice's status from `invoice_balances` (paid vs total) —
 * the single source of truth for that math. Call this after anything that
 * can change the paid or total amount: recording a payment, deleting a
 * payment, or editing amount/tax/discount.
 *
 * Never touches a `draft` invoice — drafts only move to `sent` explicitly
 * (MarkSentButton), never automatically just because a payment happened to
 * land against one.
 */
export async function recomputeInvoiceStatus(service: SupabaseClient, invoiceId: string): Promise<void> {
  const { data: existing } = await service
    .from("invoices")
    .select("status")
    .eq("id", invoiceId)
    .single<{ status: string }>();
  if (!existing || existing.status === "draft") return;

  const { data: balance } = await service
    .from("invoice_balances")
    .select("total, paid")
    .eq("invoice_id", invoiceId)
    .single<Pick<InvoiceBalance, "total" | "paid">>();
  if (!balance) return;

  const newStatus =
    balance.total > 0 && balance.paid >= balance.total ? "paid" : balance.paid > 0 ? "partially_paid" : "sent";

  if (newStatus !== existing.status) {
    await service.from("invoices").update({ status: newStatus }).eq("id", invoiceId);
  }
}

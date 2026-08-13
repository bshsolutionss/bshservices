import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { logActivity } from "@/lib/activity";
import { recomputeInvoiceStatus } from "@/lib/admin/recompute-invoice-status";
import { formatMoney, type Currency, type Payment } from "@/lib/invoices";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id: invoiceId, paymentId } = await params;
  const service = createServiceRoleClient();

  const { data: payment } = await service
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .eq("invoice_id", invoiceId)
    .single<Payment>();
  if (!payment) {
    return NextResponse.json({ ok: false, error: "Payment not found." }, { status: 404 });
  }

  const { error } = await service.from("payments").delete().eq("id", paymentId);
  if (error) {
    console.error("[api/admin/invoices/payments] delete failed:", error);
    return NextResponse.json({ ok: false, error: "Could not delete payment." }, { status: 500 });
  }

  // A payment disappearing can move an invoice back from paid → partially_paid → sent.
  await recomputeInvoiceStatus(service, invoiceId);

  const { data: invoice } = await service
    .from("invoices")
    .select("currency")
    .eq("id", invoiceId)
    .single<{ currency: string }>();

  await logActivity({
    entityType: "invoice",
    entityId: invoiceId,
    type: "payment_deleted",
    // formatMoney validates the currency string at runtime and falls back to
    // USD for anything unexpected, so this cast is safe even on bad data.
    description: `Payment of ${formatMoney(payment.amount, (invoice?.currency as Currency) ?? "USD")} removed`,
  });

  return NextResponse.json({ ok: true });
}

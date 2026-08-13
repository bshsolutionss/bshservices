import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { logActivity } from "@/lib/activity";
import { PAYMENT_METHODS, type PaymentMethod, type InvoiceBalance } from "@/lib/invoices";

interface CreatePayload {
  amount: number;
  paid_on?: string;
  method?: PaymentMethod;
  reference?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id: invoiceId } = await params;

  let payload: CreatePayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  if (!payload.amount || payload.amount <= 0) {
    return NextResponse.json({ ok: false, error: "A positive amount is required." }, { status: 400 });
  }
  if (payload.method && !PAYMENT_METHODS.includes(payload.method)) {
    return NextResponse.json({ ok: false, error: "Invalid payment method." }, { status: 400 });
  }

  const service = createServiceRoleClient();

  const { error: insertError } = await service.from("payments").insert({
    invoice_id: invoiceId,
    amount: payload.amount,
    paid_on: payload.paid_on || new Date().toISOString().slice(0, 10),
    method: payload.method || null,
    reference: payload.reference?.trim() || null,
  });

  if (insertError) {
    console.error("[api/admin/invoices/payments] insert failed:", insertError);
    return NextResponse.json({ ok: false, error: "Could not record payment." }, { status: 500 });
  }

  // Recompute status from invoice_balances (single source of truth for
  // paid/total) rather than re-deriving the math here — idempotent even if
  // called again for the same invoice.
  const { data: balance } = await service
    .from("invoice_balances")
    .select("total, paid")
    .eq("invoice_id", invoiceId)
    .single<Pick<InvoiceBalance, "total" | "paid">>();

  if (balance) {
    const newStatus = balance.paid >= balance.total ? "paid" : balance.paid > 0 ? "partially_paid" : undefined;
    if (newStatus) {
      await service.from("invoices").update({ status: newStatus }).eq("id", invoiceId);
    }
  }

  await logActivity({
    entityType: "invoice",
    entityId: invoiceId,
    type: "payment_received",
    description: `Payment of $${payload.amount.toLocaleString()} received${payload.method ? ` via ${payload.method}` : ""}`,
  });

  return NextResponse.json({ ok: true });
}

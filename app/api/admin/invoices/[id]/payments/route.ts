import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { logActivity } from "@/lib/activity";
import { recomputeInvoiceStatus } from "@/lib/admin/recompute-invoice-status";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/invoices";

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

  await recomputeInvoiceStatus(service, invoiceId);

  await logActivity({
    entityType: "invoice",
    entityId: invoiceId,
    type: "payment_received",
    description: `Payment of $${payload.amount.toLocaleString()} received${payload.method ? ` via ${payload.method}` : ""}`,
  });

  return NextResponse.json({ ok: true });
}

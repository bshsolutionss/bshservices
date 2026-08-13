import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { logActivity } from "@/lib/activity";
import { recomputeInvoiceStatus } from "@/lib/admin/recompute-invoice-status";
import { CURRENCIES, type Currency } from "@/lib/invoices";

const STATUS_ONLY_VALUES = ["draft", "sent"] as const;

interface UpdatePayload {
  status?: (typeof STATUS_ONLY_VALUES)[number];
  amount?: number;
  tax?: number;
  discount?: number;
  currency?: Currency;
  due_date?: string | null;
  notes?: string | null;
  project_id?: string | null;
}

/** Handles both the quick "mark as sent" action and full field edits from
 * InvoiceEditControl. `total` is a DB-generated column (amount + tax -
 * discount) — never set directly — so any amount/tax/discount edit triggers
 * a status recompute afterward in case it moves the invoice across the
 * paid/partially_paid boundary. Payment recording (which also touches
 * status) still goes through the payments route. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id } = await params;

  let payload: UpdatePayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if (payload.status !== undefined) {
    if (!STATUS_ONLY_VALUES.includes(payload.status)) {
      return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
    }
    updates.status = payload.status;
  }
  if (payload.amount !== undefined) {
    if (!Number.isFinite(Number(payload.amount)) || Number(payload.amount) <= 0) {
      return NextResponse.json({ ok: false, error: "Amount must be a positive number." }, { status: 400 });
    }
    updates.amount = Number(payload.amount);
  }
  if (payload.tax !== undefined) updates.tax = Number(payload.tax) || 0;
  if (payload.discount !== undefined) updates.discount = Number(payload.discount) || 0;
  if (payload.currency !== undefined) {
    if (!CURRENCIES.includes(payload.currency)) {
      return NextResponse.json({ ok: false, error: "Invalid currency." }, { status: 400 });
    }
    updates.currency = payload.currency;
  }
  if (payload.due_date !== undefined) updates.due_date = payload.due_date || null;
  if (payload.notes !== undefined) updates.notes = payload.notes ? String(payload.notes).slice(0, 5000) : null;
  if (payload.project_id !== undefined) updates.project_id = payload.project_id || null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { error } = await service.from("invoices").update(updates).eq("id", id);

  if (error) {
    console.error("[api/admin/invoices] update failed:", error);
    return NextResponse.json({ ok: false, error: "Update failed." }, { status: 500 });
  }

  const changedMoney = payload.amount !== undefined || payload.tax !== undefined || payload.discount !== undefined;
  if (changedMoney) {
    await recomputeInvoiceStatus(service, id);
    await logActivity({ entityType: "invoice", entityId: id, type: "invoice_updated", description: "Invoice amount updated" });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id } = await params;
  const service = createServiceRoleClient();

  // Safe unconditionally: payments.invoice_id cascades (its payments go
  // with it) — the client-side confirm dialog warns about this first.
  const { error } = await service.from("invoices").delete().eq("id", id);

  if (error) {
    console.error("[api/admin/invoices] delete failed:", error);
    return NextResponse.json({ ok: false, error: "Could not delete invoice." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

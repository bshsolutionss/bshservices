import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { logActivity } from "@/lib/activity";
import { recomputeInvoiceStatus } from "@/lib/admin/recompute-invoice-status";
import { MIGRATION_HINT, isMissingSchemaError, normalizeInvoiceItems } from "@/lib/admin/invoice-items";

/**
 * Replaces an invoice's line items with the list given.
 *
 * One endpoint for add/edit/reorder/remove on purpose: the editor always
 * holds the whole list, so sending it whole keeps both sides in one state
 * instead of juggling per-row create/update/delete calls and partial
 * failures. The DB recomputes amount/tax/total from the result, then the
 * invoice's paid/partially_paid status is re-evaluated against the new total.
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id } = await params;

  let body: { items?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = normalizeInvoiceItems(body.items);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }
  if (parsed.items.length === 0) {
    return NextResponse.json({ ok: false, error: "An invoice needs at least one line item." }, { status: 400 });
  }

  const service = createServiceRoleClient();

  const { data: invoice, error: lookupError } = await service
    .from("invoices")
    .select("id, invoice_number")
    .eq("id", id)
    .single();
  if (lookupError || !invoice) {
    return NextResponse.json({ ok: false, error: "Invoice not found." }, { status: 404 });
  }

  // Kept so the previous lines can be put back if the replacement insert fails.
  const { data: previous, error: readError } = await service
    .from("invoice_items")
    .select("description, quantity, unit_price, position")
    .eq("invoice_id", id)
    .order("position");

  if (readError && isMissingSchemaError(readError)) {
    return NextResponse.json({ ok: false, error: MIGRATION_HINT }, { status: 500 });
  }

  const { error: deleteError } = await service.from("invoice_items").delete().eq("invoice_id", id);
  if (deleteError) {
    console.error("[api/admin/invoices/items] delete failed:", deleteError);
    return NextResponse.json({ ok: false, error: "Could not update the line items." }, { status: 500 });
  }

  const { error: insertError } = await service.from("invoice_items").insert(
    parsed.items.map((item, index) => ({ ...item, invoice_id: id, position: index }))
  );

  if (insertError) {
    console.error("[api/admin/invoices/items] insert failed, restoring previous lines:", insertError);
    if (previous && previous.length > 0) {
      await service.from("invoice_items").insert(previous.map((item) => ({ ...item, invoice_id: id })));
    }
    const message = isMissingSchemaError(insertError) ? MIGRATION_HINT : "Could not update the line items.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }

  // The total just moved, so "paid"/"partially_paid" may no longer be right.
  await recomputeInvoiceStatus(service, id);

  await logActivity({
    entityType: "invoice",
    entityId: id,
    type: "invoice_items_updated",
    description: `Line items updated (${parsed.items.length} line${parsed.items.length === 1 ? "" : "s"})`,
  });

  return NextResponse.json({ ok: true });
}

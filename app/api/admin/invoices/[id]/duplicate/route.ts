import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { logActivity } from "@/lib/activity";
import { getInvoiceSettings } from "@/lib/admin/invoice-settings";
import { todayInPkt } from "@/lib/availability";
import type { Invoice, InvoiceItem } from "@/lib/invoices";

/** Copies an invoice (header + line items) into a fresh draft dated today - handy for repeat work. */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id } = await params;
  const service = createServiceRoleClient();

  const [{ data: source }, { data: itemsData }, settings] = await Promise.all([
    service.from("invoices").select("*").eq("id", id).single<Invoice>(),
    service.from("invoice_items").select("*").eq("invoice_id", id).order("position"),
    getInvoiceSettings(),
  ]);
  if (!source) return NextResponse.json({ ok: false, error: "Invoice not found." }, { status: 404 });
  const items = (itemsData ?? []) as InvoiceItem[];

  const { data: number, error: numberError } = await service.rpc("next_invoice_number");
  if (numberError || !number) {
    return NextResponse.json({ ok: false, error: "Could not generate an invoice number." }, { status: 500 });
  }

  const issueDate = todayInPkt();
  const due = new Date(`${issueDate}T00:00:00Z`);
  due.setUTCDate(due.getUTCDate() + settings.default_due_days);

  const { data: copy, error } = await service
    .from("invoices")
    .insert({
      invoice_number: number,
      client_id: source.client_id,
      project_id: source.project_id,
      amount: source.amount,
      tax_rate: source.tax_rate,
      tax: source.tax,
      discount: source.discount,
      currency: source.currency,
      issue_date: issueDate,
      due_date: due.toISOString().slice(0, 10),
      notes: source.notes,
      terms: source.terms,
      po_number: source.po_number,
      status: "draft",
    })
    .select("id, invoice_number")
    .single<{ id: string; invoice_number: string }>();
  if (error || !copy) {
    console.error("[api/admin/invoices/duplicate] insert failed:", error);
    return NextResponse.json({ ok: false, error: "Could not duplicate the invoice." }, { status: 500 });
  }

  if (items.length > 0) {
    const { error: itemsError } = await service.from("invoice_items").insert(
      items.map((item, index) => ({
        invoice_id: copy.id,
        position: index,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }))
    );
    if (itemsError) {
      await service.from("invoices").delete().eq("id", copy.id);
      return NextResponse.json({ ok: false, error: "Could not copy the line items." }, { status: 500 });
    }
  }

  await logActivity({
    entityType: "invoice",
    entityId: copy.id,
    type: "invoice_created",
    description: `Duplicated from ${source.invoice_number}`,
  });

  return NextResponse.json({ ok: true, id: copy.id, invoice_number: copy.invoice_number });
}

import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { logActivity } from "@/lib/activity";
import { CURRENCIES, type Currency } from "@/lib/invoices";
import {
  MIGRATION_HINT,
  isMissingSchemaError,
  normalizeInvoiceItems,
  subtotalOf,
} from "@/lib/admin/invoice-items";

interface CreatePayload {
  client_id: string;
  project_id?: string;
  /** Line items — the normal path. */
  items?: unknown;
  /** Flat subtotal, for an invoice billed as a single figure with no itemisation. */
  amount?: number;
  /** Percentage. The DB derives the absolute tax from it. */
  tax_rate?: number;
  discount?: number;
  currency?: Currency;
  issue_date?: string;
  due_date?: string;
  notes?: string;
  po_number?: string;
  terms?: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Creates a draft invoice.
 *
 * The flow, in order, with no money math in this file:
 *   1. validate the request,
 *   2. reserve an invoice number (race-safe DB function),
 *   3. insert the invoice header,
 *   4. insert its line items — triggers then derive amount, tax and total.
 *
 * If step 4 fails the header is removed again, so a failed request never
 * leaves a half-built invoice (and never burns a visible number on one).
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  let payload: CreatePayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  /* ── 1. validate ── */

  if (!payload.client_id) {
    return NextResponse.json({ ok: false, error: "A client is required." }, { status: 400 });
  }

  const parsedItems = normalizeInvoiceItems(payload.items);
  if (!parsedItems.ok) {
    return NextResponse.json({ ok: false, error: parsedItems.error }, { status: 400 });
  }
  const items = parsedItems.items;

  // Either itemised or a flat amount — the subtotal has to come from somewhere.
  const subtotal = items.length > 0 ? subtotalOf(items) : Number(payload.amount ?? 0);
  if (!Number.isFinite(subtotal) || subtotal <= 0) {
    return NextResponse.json(
      { ok: false, error: "Add at least one line item with a positive amount." },
      { status: 400 }
    );
  }

  if (payload.currency && !CURRENCIES.includes(payload.currency)) {
    return NextResponse.json({ ok: false, error: "Invalid currency." }, { status: 400 });
  }

  const taxRate = Number(payload.tax_rate ?? 0);
  if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
    return NextResponse.json({ ok: false, error: "Tax rate must be between 0 and 100." }, { status: 400 });
  }

  const discount = Number(payload.discount ?? 0);
  if (!Number.isFinite(discount) || discount < 0) {
    return NextResponse.json({ ok: false, error: "Discount can't be negative." }, { status: 400 });
  }

  const issueDate = payload.issue_date || new Date().toISOString().slice(0, 10);
  if (!ISO_DATE.test(issueDate)) {
    return NextResponse.json({ ok: false, error: "Invalid issue date." }, { status: 400 });
  }
  if (payload.due_date && !ISO_DATE.test(payload.due_date)) {
    return NextResponse.json({ ok: false, error: "Invalid due date." }, { status: 400 });
  }
  if (payload.due_date && payload.due_date < issueDate) {
    return NextResponse.json({ ok: false, error: "Due date cannot be before the issue date." }, { status: 400 });
  }

  const service = createServiceRoleClient();

  /* ── 2. reserve the invoice number ── */

  // next_invoice_number() returns a plain scalar (text), not a row set, so
  // `data` here is the string itself — no .single() needed (that's for
  // set-returning functions, like convert_lead_to_client_and_project).
  const { data: numberData, error: numberError } = await service.rpc("next_invoice_number");
  if (numberError || !numberData) {
    console.error("[api/admin/invoices] number generation failed:", numberError);
    return NextResponse.json({ ok: false, error: "Could not generate invoice number." }, { status: 500 });
  }

  /* ── 3. insert the header ── */

  const { data: invoice, error: insertError } = await service
    .from("invoices")
    .insert({
      invoice_number: numberData,
      client_id: payload.client_id,
      project_id: payload.project_id || null,
      // Derived from the items by trigger as soon as they land; seeded here
      // so a flat-amount invoice (no items) is correct too.
      amount: subtotal,
      tax_rate: taxRate,
      discount,
      currency: payload.currency || "PKR",
      issue_date: issueDate,
      due_date: payload.due_date || null,
      notes: payload.notes?.trim().slice(0, 5000) || null,
      po_number: payload.po_number?.trim().slice(0, 100) || null,
      terms: payload.terms?.trim().slice(0, 3000) || null,
      status: "draft",
    })
    .select("id, invoice_number")
    .single();

  if (insertError || !invoice) {
    console.error("[api/admin/invoices] insert failed:", insertError);
    const message = isMissingSchemaError(insertError) ? MIGRATION_HINT : "Could not create invoice.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }

  /* ── 4. insert the line items ── */

  if (items.length > 0) {
    const { error: itemsError } = await service.from("invoice_items").insert(
      items.map((item, index) => ({ ...item, invoice_id: invoice.id, position: index }))
    );

    if (itemsError) {
      console.error("[api/admin/invoices] line items failed, rolling back header:", itemsError);
      await service.from("invoices").delete().eq("id", invoice.id);
      const message = isMissingSchemaError(itemsError) ? MIGRATION_HINT : "Could not save the line items.";
      return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
  }

  await logActivity({
    entityType: "invoice",
    entityId: invoice.id,
    type: "invoice_created",
    description:
      `Invoice ${invoice.invoice_number} created as draft` +
      (items.length > 0 ? ` with ${items.length} line item${items.length === 1 ? "" : "s"}` : ""),
  });

  return NextResponse.json({ ok: true, id: invoice.id, invoice_number: invoice.invoice_number });
}

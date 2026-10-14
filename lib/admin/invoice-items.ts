/**
 * Shared server-side handling for invoice line items.
 *
 * Both the create route (POST /api/admin/invoices) and the replace route
 * (PUT /api/admin/invoices/[id]/items) accept the same list shape, so the
 * validation lives here once instead of being duplicated — and neither
 * route computes money: the database derives amount/tax/total from the rows
 * written here (see supabase/migrations/0010_invoice_items.sql).
 */
import type { PostgrestError } from "@supabase/supabase-js";

export interface NormalizedInvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
}

/** Validates and cleans a raw `items` payload. Returns either the rows to insert or one human-readable error. */
export function normalizeInvoiceItems(
  raw: unknown
): { ok: true; items: NormalizedInvoiceItem[] } | { ok: false; error: string } {
  if (raw === undefined || raw === null) return { ok: true, items: [] };
  if (!Array.isArray(raw)) return { ok: false, error: "Line items must be a list." };
  if (raw.length > 100) return { ok: false, error: "An invoice can have at most 100 line items." };

  const items: NormalizedInvoiceItem[] = [];
  for (const [index, entry] of raw.entries()) {
    const line = entry as Record<string, unknown>;
    const description = typeof line?.description === "string" ? line.description.trim() : "";
    const quantity = Number(line?.quantity ?? 1);
    const unitPrice = Number(line?.unit_price ?? 0);
    const position = index + 1;

    if (!description) return { ok: false, error: `Line ${position}: a description is required.` };
    if (description.length > 500) return { ok: false, error: `Line ${position}: description is too long.` };
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { ok: false, error: `Line ${position}: quantity must be greater than zero.` };
    }
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      return { ok: false, error: `Line ${position}: unit price can't be negative.` };
    }

    items.push({ description, quantity, unit_price: unitPrice });
  }

  return { ok: true, items };
}

/** Subtotal of a normalized list, rounded like the DB's generated line_total column. */
export function subtotalOf(items: NormalizedInvoiceItem[]): number {
  const sum = items.reduce((total, item) => total + Math.round(item.quantity * item.unit_price * 100) / 100, 0);
  return Math.round(sum * 100) / 100;
}

/**
 * True when Postgres/PostgREST is telling us the column or table from
 * migration 0010 isn't there yet. Worth detecting explicitly: the raw
 * message ("Could not find the 'tax_rate' column in the schema cache") reads
 * like a bug, when the real fix is a one-time SQL run.
 */
export function isMissingSchemaError(error: PostgrestError | null): boolean {
  if (!error) return false;
  return (
    error.code === "PGRST204" ||
    error.code === "PGRST205" ||
    error.code === "42703" ||
    error.code === "42P01" ||
    /schema cache|does not exist/i.test(error.message ?? "")
  );
}

export const MIGRATION_HINT =
  "Invoice line items need a one-time database update: run supabase/migrations/0010_invoice_items.sql in the Supabase SQL editor.";

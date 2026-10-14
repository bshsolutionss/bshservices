/** Shared types/constants for invoices/payments — mirrors lib/leads.ts's shape. */

export type InvoiceStatus = "draft" | "sent" | "paid" | "partially_paid";
/** Editable in Settings > Lists (keys like bank_transfer for the built-ins). */
export type PaymentMethod = string;
export type Currency = "USD" | "PKR" | "CAD" | "AUD";

export interface Invoice {
  id: string;
  created_at: string;
  invoice_number: string;
  client_id: string;
  project_id: string | null;
  /** Subtotal. Derived from the line items by DB trigger when the invoice has any — see supabase/migrations/0010_invoice_items.sql. */
  amount: number;
  /** Absolute tax amount. Derived from `tax_rate` by DB trigger whenever a rate is set. */
  tax: number;
  /** Tax percentage (0 = tax entered as a flat amount instead). */
  tax_rate: number;
  discount: number;
  /** DB-generated: amount + tax - discount. Never written directly. */
  total: number;
  currency: Currency;
  /** The date the invoice is dated for — what finance reports bucket accrual revenue by. */
  issue_date: string;
  due_date: string | null;
  status: InvoiceStatus;
  notes: string | null;
  /** "YYYY-MM" for a monthly retainer invoice; null for ordinary invoices. */
  billing_period: string | null;
  po_number: string | null;
  /** Per-invoice terms; falls back to the default terms in Settings. */
  terms: string | null;
  sent_at: string | null;
  last_emailed_at: string | null;
}

/** A billable line on an invoice. `line_total` is DB-generated (quantity x unit_price). */
export interface InvoiceItem {
  id: string;
  created_at: string;
  invoice_id: string;
  position: number;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

/** The shape the UI edits and the API accepts — no ids, since lines are saved as a whole list. */
export interface InvoiceItemInput {
  description: string;
  quantity: number;
  unit_price: number;
}

/**
 * Row from the `invoice_balances` view — single source of truth for
 * paid/balance/overdue, and (since 0010) rich enough to render the whole
 * invoices list without a second query against `invoices`.
 */
export interface InvoiceBalance {
  invoice_id: string;
  client_id: string;
  status: InvoiceStatus;
  due_date: string | null;
  total: number;
  currency: Currency;
  paid: number;
  balance: number;
  is_overdue: boolean;
  invoice_number: string;
  project_id: string | null;
  issue_date: string;
  amount: number;
  tax: number;
  tax_rate: number;
  discount: number;
  notes: string | null;
  created_at: string;
  item_count: number;
  last_payment_on: string | null;
}

export interface Payment {
  id: string;
  created_at: string;
  invoice_id: string;
  amount: number;
  paid_on: string;
  method: PaymentMethod | null;
  reference: string | null;
}

export const INVOICE_STATUSES: InvoiceStatus[] = ["draft", "sent", "paid", "partially_paid"];

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  partially_paid: "Partially Paid",
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, { bg: string; text: string }> = {
  draft: { bg: "#F1F1F1", text: "#4B5563" },
  sent: { bg: "#DBEAFE", text: "#1E40AF" },
  paid: { bg: "#D1FAE5", text: "#065F46" },
  partially_paid: { bg: "#FEF3C7", text: "#92400E" },
};

export const PAYMENT_METHODS: PaymentMethod[] = ["cash", "bank_transfer", "card", "cheque", "other"];

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  card: "Card",
  cheque: "Cheque",
  other: "Other",
};

export const CURRENCIES: Currency[] = ["USD", "PKR", "CAD", "AUD"];

export const CURRENCY_LABELS: Record<Currency, string> = {
  USD: "US Dollar (USD)",
  PKR: "Pakistani Rupee (PKR)",
  CAD: "Canadian Dollar (CAD)",
  AUD: "Australian Dollar (AUD)",
};

/**
 * Locale-aware currency formatting — deliberately NOT "narrowSymbol", which
 * would render USD/CAD/AUD all as an ambiguous plain "$". The default
 * "symbol" display disambiguates them ("$" / "CA$" / "A$") while PKR falls
 * back to its ISO code since en-US has no common glyph for it.
 *
 * Defensive on purpose: `Intl.NumberFormat` throws a hard RangeError for an
 * invalid/missing currency code, which would otherwise crash the whole page
 * (this is a server component helper — an uncaught throw here becomes a
 * full Next.js error page, not just a broken widget). A stale/partial DB
 * migration or an old row is exactly the kind of thing that can hand this
 * an unexpected value, so falling back to "USD" instead of throwing keeps
 * one bad row from taking down the entire dashboard.
 */
export function formatMoney(amount: number, currency: Currency | null | undefined): string {
  const safeCurrency = currency && (CURRENCIES as string[]).includes(currency) ? currency : "USD";
  const safeAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: safeCurrency,
  }).format(safeAmount);
}

/**
 * Sums can't cross currencies (PKR + USD isn't a number) — group by
 * currency and format each total separately, e.g. "$500 + PKR 20,000".
 * Shared by the dashboard and the expenses page (anywhere multiple
 * currency-tagged amounts need to be totaled for display).
 */
export function formatByCurrency(amounts: { amount: number; currency: Currency | null | undefined }[]): string {
  const byCurrency = new Map<Currency, number>();
  for (const { amount, currency } of amounts) {
    const safeCurrency = currency && (CURRENCIES as string[]).includes(currency) ? currency : "USD";
    byCurrency.set(safeCurrency, (byCurrency.get(safeCurrency) ?? 0) + Number(amount));
  }
  if (byCurrency.size === 0) return formatMoney(0, "USD");
  return Array.from(byCurrency.entries())
    .map(([currency, total]) => formatMoney(total, currency))
    .join(" + ");
}

/**
 * The one place invoice arithmetic lives on the TypeScript side — used by
 * the create/edit forms to preview totals before saving. It mirrors exactly
 * what the database computes on write (see 0010_invoice_items.sql), so the
 * preview can never disagree with the saved invoice.
 */
export interface InvoiceTotals {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}

export function round2(value: number): number {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export function computeInvoiceTotals(
  items: { quantity: number | string; unit_price: number | string }[],
  taxRate: number | string,
  discount: number | string
): InvoiceTotals {
  const subtotal = round2(
    items.reduce((sum, item) => sum + round2((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)), 0)
  );
  const tax = round2((subtotal * (Number(taxRate) || 0)) / 100);
  const safeDiscount = round2(Number(discount) || 0);
  return { subtotal, tax, discount: safeDiscount, total: round2(subtotal + tax - safeDiscount) };
}

/** Short, locale-aware date for list/detail screens. Keeps "—" for empty dates consistent panel-wide. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/** Shared types/constants for invoices/payments — mirrors lib/leads.ts's shape. */

export type InvoiceStatus = "draft" | "sent" | "paid" | "partially_paid";
export type PaymentMethod = "cash" | "bank_transfer" | "card" | "cheque" | "other";
export type Currency = "USD" | "PKR" | "CAD" | "AUD";

export interface Invoice {
  id: string;
  created_at: string;
  invoice_number: string;
  client_id: string;
  project_id: string | null;
  amount: number;
  tax: number;
  discount: number;
  total: number;
  currency: Currency;
  due_date: string | null;
  status: InvoiceStatus;
  notes: string | null;
}

/** Row from the `invoice_balances` view — single source of truth for paid/balance/overdue. */
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

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
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

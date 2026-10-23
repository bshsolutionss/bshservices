/** Small formatting helpers shared by the portal screens. */
import { formatMoney, type Currency } from "@/lib/invoices";

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function longDate(date = new Date()): string {
  return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }).toUpperCase();
}

export function dateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function timeOnly(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
}

export function fileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Start of the financial year containing `date` (July 1 - the Pakistani fiscal year). */
export function fiscalYearStart(date = new Date()): Date {
  const y = date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1;
  return new Date(Date.UTC(y, 6, 1));
}


/** "PKR 1,000.00 + $20.00" - sums per currency so mixed-currency clients never see a meaningless total. */
export function moneyByCurrency(rows: { amount: number; currency: Currency | string }[]): string {
  const totals = new Map<string, number>();
  for (const r of rows) totals.set(r.currency, (totals.get(r.currency) ?? 0) + r.amount);
  if (totals.size === 0) return formatMoney(0, "PKR");
  return [...totals.entries()].map(([cur, amt]) => formatMoney(amt, cur as Currency)).join(" + ");
}

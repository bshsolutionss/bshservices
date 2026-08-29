/**
 * PKR conversion — layered on top of lib/invoices.ts's Currency/formatMoney.
 * PKR is the business's standard currency; anything billed/spent/valued in
 * USD/CAD/AUD gets converted to one PKR figure for aggregate views (the
 * dashboard KPIs, and the "this month"/"outstanding" summary lines on the
 * Expenses/Invoices list pages) using rates the admin maintains themselves
 * (see /admin's Settings → Exchange Rates) rather than a live FX feed.
 *
 * Individual records (an invoice, an expense, a project) always keep and
 * display their own real currency — conversion only happens when multiple
 * currency-tagged amounts need to collapse into a single summary number.
 */
import { CURRENCIES, type Currency } from "@/lib/invoices";

export type ExchangeRates = Record<Currency, number>;

/** Seed/fallback values — only used if a currency's row is somehow missing from the DB. Kept in sync with supabase/migrations/0009_currency.sql's seed data. */
export const FALLBACK_RATES_TO_PKR: ExchangeRates = {
  PKR: 1,
  USD: 278,
  CAD: 205,
  AUD: 183,
};

export function convertToPKR(amount: number, currency: Currency | null | undefined, rates: ExchangeRates): number {
  const safeCurrency = currency && (CURRENCIES as string[]).includes(currency) ? currency : "PKR";
  const rate = rates[safeCurrency] ?? FALLBACK_RATES_TO_PKR[safeCurrency] ?? 1;
  return Number(amount) * rate;
}

/** Sums a list of currency-tagged amounts into one PKR total. */
export function sumToPKR(
  amounts: { amount: number; currency: Currency | null | undefined }[],
  rates: ExchangeRates
): number {
  return amounts.reduce((total, { amount, currency }) => total + convertToPKR(amount, currency, rates), 0);
}

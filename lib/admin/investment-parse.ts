import { INVESTMENT_STATUSES, type InvestmentStatus } from "@/lib/investments";
import { CURRENCIES, type Currency } from "@/lib/invoices";

export interface InvestmentPayload {
  name?: string;
  investment_type?: string | null;
  currency?: Currency;
  invested_amount?: number;
  current_value?: number;
  invested_on?: string;
  status?: InvestmentStatus;
  expected_return_pct?: number | null;
  notes?: string | null;
}

/** Shared by create and update so both enforce the same rules. `partial` = update (fields optional). */
export function parseInvestment(
  payload: InvestmentPayload,
  partial: boolean
): { error: string } | { values: Record<string, unknown> } {
  const values: Record<string, unknown> = {};
  if (payload.name !== undefined || !partial) {
    const name = payload.name?.trim().slice(0, 150);
    if (!name) return { error: "A name is required." };
    values.name = name;
  }
  if (payload.investment_type !== undefined) {
    values.investment_type = payload.investment_type?.trim().slice(0, 80) || null;
  }
  if (payload.currency !== undefined) {
    if (!(CURRENCIES as string[]).includes(payload.currency)) return { error: "Invalid currency." };
    values.currency = payload.currency;
  }
  for (const field of ["invested_amount", "current_value"] as const) {
    if (payload[field] !== undefined) {
      const n = Number(payload[field]);
      if (!Number.isFinite(n) || n < 0) return { error: "Amounts can't be negative." };
      values[field] = n;
    }
  }
  if (payload.invested_on !== undefined) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.invested_on)) return { error: "Invalid date." };
    values.invested_on = payload.invested_on;
  }
  if (payload.status !== undefined) {
    if (!INVESTMENT_STATUSES.includes(payload.status)) return { error: "Invalid status." };
    values.status = payload.status;
  }
  if (payload.expected_return_pct !== undefined) {
    const raw = payload.expected_return_pct as unknown;
    values.expected_return_pct = raw === null || raw === "" ? null : Number(raw);
  }
  if (payload.notes !== undefined) values.notes = payload.notes?.trim().slice(0, 5000) || null;
  return { values };
}

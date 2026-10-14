/**
 * Profit & loss reporting.
 *
 * Everything here is pure: the page fetches rows, these functions bucket and
 * total them. No Supabase, no React — so the arithmetic that leadership reads
 * off the finance screen lives in one place that can be reasoned about on its
 * own.
 *
 * Two deliberate decisions:
 *
 * 1. **Reported in PKR.** A P&L has to add up, and PKR 20,000 + $500 is not a
 *    number. Every amount is converted with the admin-maintained rates from
 *    /admin/settings/exchange-rates (see lib/currency.ts). Individual
 *    invoices and expenses keep their own currency everywhere else.
 *
 * 2. **Two revenue bases**, because they answer different questions:
 *    - `cash` — money actually received (payments, bucketed by `paid_on`).
 *      This is what the bank account did.
 *    - `accrual` — money invoiced (non-draft invoices, bucketed by
 *      `issue_date`). This is what the business earned.
 *    Expenses are bucketed by `expense_date` under both.
 */
import { convertToPKR, type ExchangeRates } from "@/lib/currency";
import type { Currency } from "@/lib/invoices";
import type { ExpenseCategory } from "@/lib/expenses";

export type RevenueBasis = "cash" | "accrual";

export const REVENUE_BASIS_LABELS: Record<RevenueBasis, string> = {
  cash: "Cash received",
  accrual: "Invoiced",
};

export const REVENUE_BASIS_HINTS: Record<RevenueBasis, string> = {
  cash: "Counts payments on the date they were received.",
  accrual: "Counts sent invoices on their issue date.",
};

/* ───────────────────────── month keys ───────────────────────── */

/** A month is identified by its "YYYY-MM" prefix — the same shape as an <input type="month"> value. */
export type MonthKey = string;

export function monthKeyOf(date: string | Date): MonthKey {
  if (typeof date === "string") return date.slice(0, 7);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function currentMonthKey(): MonthKey {
  return monthKeyOf(new Date());
}

export function shiftMonth(key: MonthKey, months: number): MonthKey {
  const [year, month] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + months, 1));
  return monthKeyOf(date);
}

export function isValidMonthKey(value: string | undefined | null): value is MonthKey {
  return !!value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

/** Inclusive list of months. Capped at 60 so a malformed range can't ask for thousands of rows. */
export function monthRange(from: MonthKey, to: MonthKey): MonthKey[] {
  const months: MonthKey[] = [];
  let cursor = from;
  while (cursor <= to && months.length < 60) {
    months.push(cursor);
    cursor = shiftMonth(cursor, 1);
  }
  return months;
}

export function monthLabel(key: MonthKey, options: { withYear?: boolean } = {}): string {
  const [year, month] = key.split("-").map(Number);
  const name = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-GB", {
    month: "short",
    timeZone: "UTC",
  });
  return options.withYear ? `${name} ${String(year).slice(2)}` : name;
}

/** First day of a month, as a date string suitable for a Postgres `date` comparison. */
export function monthStartDate(key: MonthKey): string {
  return `${key}-01`;
}

/** First day of the month AFTER `key` — the exclusive upper bound of a range query. */
export function monthEndExclusive(key: MonthKey): string {
  return monthStartDate(shiftMonth(key, 1));
}

/* ───────────────────────── input rows ───────────────────────── */

export interface PaymentRow {
  amount: number;
  paid_on: string;
  currency: Currency | null;
  client_id: string | null;
  project_id: string | null;
}

export interface InvoiceRow {
  total: number;
  issue_date: string;
  currency: Currency | null;
  status: string;
  client_id: string | null;
  project_id: string | null;
}

export interface ExpenseRow {
  amount: number;
  expense_date: string;
  currency: Currency | null;
  category: ExpenseCategory | string;
}

/* ───────────────────────── output ───────────────────────── */

export interface MonthlyPL {
  month: MonthKey;
  label: string;
  /** Revenue on the selected basis, in PKR. */
  revenue: number;
  expenses: number;
  profit: number;
  /** profit / revenue, as a percentage. null when there was no revenue to divide by. */
  margin: number | null;
}

export interface CategoryTotal {
  category: string;
  amount: number;
  /** Share of total expenses, 0–100. */
  share: number;
}

export interface NamedTotal {
  id: string;
  amount: number;
}

export interface ProfitLossReport {
  months: MonthlyPL[];
  totals: {
    revenue: number;
    expenses: number;
    profit: number;
    margin: number | null;
    /** Monthly average across the months in range. */
    averageRevenue: number;
    averageExpenses: number;
    averageProfit: number;
  };
  best: MonthlyPL | null;
  worst: MonthlyPL | null;
  expensesByCategory: CategoryTotal[];
  revenueByClient: NamedTotal[];
  revenueByProject: NamedTotal[];
  /** Months in range that recorded nothing at all — flagged so a gap isn't read as a zero. */
  emptyMonths: MonthKey[];
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Buckets the given rows into one P&L row per month in [from, to].
 *
 * Rows outside the range are ignored rather than clamped, so the caller can
 * safely over-fetch (e.g. fetch a whole year and render one quarter).
 */
export function buildProfitLoss(input: {
  from: MonthKey;
  to: MonthKey;
  basis: RevenueBasis;
  payments: PaymentRow[];
  invoices: InvoiceRow[];
  expenses: ExpenseRow[];
  rates: ExchangeRates;
  /** Only count expenses in this category. Undefined = all of them. */
  category?: string;
  /** Only count revenue from this client. Undefined = all of them. */
  clientId?: string;
}): ProfitLossReport {
  const { from, to, basis, payments, invoices, expenses, rates, category, clientId } = input;
  const months = monthRange(from, to);
  const inRange = new Set(months);

  const revenueByMonth = new Map<MonthKey, number>();
  const expensesByMonth = new Map<MonthKey, number>();
  const byCategory = new Map<string, number>();
  const byClient = new Map<string, number>();
  const byProject = new Map<string, number>();
  const touched = new Set<MonthKey>();

  const addRevenue = (month: MonthKey, amount: number, row: { client_id: string | null; project_id: string | null }) => {
    revenueByMonth.set(month, (revenueByMonth.get(month) ?? 0) + amount);
    touched.add(month);
    if (row.client_id) byClient.set(row.client_id, (byClient.get(row.client_id) ?? 0) + amount);
    if (row.project_id) byProject.set(row.project_id, (byProject.get(row.project_id) ?? 0) + amount);
  };

  if (basis === "cash") {
    for (const payment of payments) {
      const month = monthKeyOf(payment.paid_on);
      if (!inRange.has(month)) continue;
      if (clientId && payment.client_id !== clientId) continue;
      addRevenue(month, convertToPKR(Number(payment.amount), payment.currency, rates), payment);
    }
  } else {
    for (const invoice of invoices) {
      // Drafts aren't revenue by any definition — the client hasn't been asked to pay.
      if (invoice.status === "draft") continue;
      const month = monthKeyOf(invoice.issue_date);
      if (!inRange.has(month)) continue;
      if (clientId && invoice.client_id !== clientId) continue;
      addRevenue(month, convertToPKR(Number(invoice.total), invoice.currency, rates), invoice);
    }
  }

  for (const expense of expenses) {
    const month = monthKeyOf(expense.expense_date);
    if (!inRange.has(month)) continue;
    if (category && expense.category !== category) continue;
    const amount = convertToPKR(Number(expense.amount), expense.currency, rates);
    expensesByMonth.set(month, (expensesByMonth.get(month) ?? 0) + amount);
    byCategory.set(expense.category, (byCategory.get(expense.category) ?? 0) + amount);
    touched.add(month);
  }

  const multiYear = months.length > 0 && months[0].slice(0, 4) !== months[months.length - 1].slice(0, 4);

  const rows: MonthlyPL[] = months.map((month) => {
    const revenue = round2(revenueByMonth.get(month) ?? 0);
    const expenseTotal = round2(expensesByMonth.get(month) ?? 0);
    const profit = round2(revenue - expenseTotal);
    return {
      month,
      label: monthLabel(month, { withYear: multiYear }),
      revenue,
      expenses: expenseTotal,
      profit,
      margin: revenue > 0 ? round2((profit / revenue) * 100) : null,
    };
  });

  const revenue = round2(rows.reduce((sum, row) => sum + row.revenue, 0));
  const expenseTotal = round2(rows.reduce((sum, row) => sum + row.expenses, 0));
  const profit = round2(revenue - expenseTotal);
  const divisor = rows.length || 1;

  const sortedByProfit = [...rows].sort((a, b) => b.profit - a.profit);
  const totalExpensesForShare = expenseTotal || 1;

  return {
    months: rows,
    totals: {
      revenue,
      expenses: expenseTotal,
      profit,
      margin: revenue > 0 ? round2((profit / revenue) * 100) : null,
      averageRevenue: round2(revenue / divisor),
      averageExpenses: round2(expenseTotal / divisor),
      averageProfit: round2(profit / divisor),
    },
    best: sortedByProfit[0] ?? null,
    worst: sortedByProfit.length > 1 ? sortedByProfit[sortedByProfit.length - 1] : null,
    expensesByCategory: [...byCategory.entries()]
      .map(([cat, amount]) => ({
        category: cat,
        amount: round2(amount),
        share: round2((amount / totalExpensesForShare) * 100),
      }))
      .sort((a, b) => b.amount - a.amount),
    revenueByClient: [...byClient.entries()]
      .map(([id, amount]) => ({ id, amount: round2(amount) }))
      .sort((a, b) => b.amount - a.amount),
    revenueByProject: [...byProject.entries()]
      .map(([id, amount]) => ({ id, amount: round2(amount) }))
      .sort((a, b) => b.amount - a.amount),
    emptyMonths: months.filter((month) => !touched.has(month)),
  };
}

/* ───────────────────────── preset ranges ───────────────────────── */

export interface RangePreset {
  id: string;
  label: string;
  resolve: () => { from: MonthKey; to: MonthKey };
}

/**
 * The ranges people actually ask for. Resolved at render time (not stored) so
 * "this year" keeps meaning this year.
 */
export const RANGE_PRESETS: RangePreset[] = [
  {
    id: "ytd",
    label: "This year",
    resolve: () => ({ from: `${new Date().getFullYear()}-01`, to: currentMonthKey() }),
  },
  {
    id: "last6",
    label: "Last 6 months",
    resolve: () => ({ from: shiftMonth(currentMonthKey(), -5), to: currentMonthKey() }),
  },
  {
    id: "last12",
    label: "Last 12 months",
    resolve: () => ({ from: shiftMonth(currentMonthKey(), -11), to: currentMonthKey() }),
  },
  {
    id: "lastyear",
    label: "Last year",
    resolve: () => {
      const year = new Date().getFullYear() - 1;
      return { from: `${year}-01`, to: `${year}-12` };
    },
  },
  {
    id: "thismonth",
    label: "This month",
    resolve: () => ({ from: currentMonthKey(), to: currentMonthKey() }),
  },
];

/** Resolves the filters a request carried into a concrete, safe range. Defaults to the last 12 months. */
export function resolveRange(params: { from?: string; to?: string; preset?: string }): {
  from: MonthKey;
  to: MonthKey;
  preset: string | null;
} {
  if (params.preset) {
    const preset = RANGE_PRESETS.find((p) => p.id === params.preset);
    if (preset) return { ...preset.resolve(), preset: preset.id };
  }

  if (isValidMonthKey(params.from) && isValidMonthKey(params.to)) {
    // Tolerate a reversed range rather than returning nothing.
    const [from, to] = params.from <= params.to ? [params.from, params.to] : [params.to, params.from];
    return { from, to, preset: null };
  }

  const fallback = RANGE_PRESETS.find((p) => p.id === "last12")!;
  return { ...fallback.resolve(), preset: "last12" };
}

/** The equally-long window immediately before [from, to] — used for the period-over-period deltas. */
export function previousRange(from: MonthKey, to: MonthKey): { from: MonthKey; to: MonthKey } {
  const length = monthRange(from, to).length || 1;
  return { from: shiftMonth(from, -length), to: shiftMonth(from, -1) };
}

/** Signed percentage change, or null when there's no baseline to compare against. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
}

import { createServiceRoleClient } from "@/lib/supabase/service";
import { getExchangeRates } from "@/lib/admin/exchange-rates";
import { sumToPKR } from "@/lib/currency";
import { todayInPkt } from "@/lib/availability";
import type { Currency } from "@/lib/invoices";

/** One timeline for money in (client payments) and money out (team and business payouts). */

export const PERIODS = [
  { key: "all", label: "All time" },
  { key: "this_week", label: "This week" },
  { key: "last_week", label: "Last week" },
  { key: "this_month", label: "This month" },
  { key: "last_month", label: "Last month" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "this_year", label: "This year" },
  { key: "custom", label: "Custom range" },
] as const;
export type PeriodKey = (typeof PERIODS)[number]["key"];

export interface Period {
  key: PeriodKey;
  label: string;
  /** Inclusive ISO dates; null = unbounded. */
  from: string | null;
  to: string | null;
}

const iso = (d: Date) => d.toISOString().slice(0, 10);
const utc = (s: string) => new Date(`${s}T00:00:00Z`);
const addDays = (s: string, n: number) => {
  const d = utc(s);
  d.setUTCDate(d.getUTCDate() + n);
  return iso(d);
};
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function resolvePeriod(key: string | undefined, from?: string, to?: string): Period {
  const today = todayInPkt();
  const t = utc(today);
  const y = t.getUTCFullYear();
  const m = t.getUTCMonth();
  const known = PERIODS.find((p) => p.key === key);
  const label = known?.label ?? "All time";
  switch (known?.key) {
    case "this_week": {
      const monday = addDays(today, -((t.getUTCDay() + 6) % 7));
      return { key: "this_week", label, from: monday, to: addDays(monday, 6) };
    }
    case "last_week": {
      const monday = addDays(today, -((t.getUTCDay() + 6) % 7) - 7);
      return { key: "last_week", label, from: monday, to: addDays(monday, 6) };
    }
    case "this_month":
      return { key: "this_month", label, from: iso(new Date(Date.UTC(y, m, 1))), to: iso(new Date(Date.UTC(y, m + 1, 0))) };
    case "last_month":
      return { key: "last_month", label, from: iso(new Date(Date.UTC(y, m - 1, 1))), to: iso(new Date(Date.UTC(y, m, 0))) };
    case "30d":
      return { key: "30d", label, from: addDays(today, -29), to: today };
    case "90d":
      return { key: "90d", label, from: addDays(today, -89), to: today };
    case "this_year":
      return { key: "this_year", label, from: `${y}-01-01`, to: `${y}-12-31` };
    case "custom": {
      const f = from && DATE_RE.test(from) ? from : null;
      const e = to && DATE_RE.test(to) ? to : null;
      return { key: "custom", label: f || e ? `${f ?? "..."} to ${e ?? "..."}` : "Custom range", from: f, to: e };
    }
    default:
      return { key: "all", label, from: null, to: null };
  }
}

export interface PaymentRecord {
  id: string;
  kind: "received" | "paid_out";
  date: string;
  title: string;
  subtitle: string;
  amount: number;
  currency: Currency;
  /** Tag shown beside the title, e.g. "Advance" or "Salaries". */
  tag: string | null;
  /** Where to delete it: the invoice payment route or the expense route. */
  deleteUrl: string;
}

type One<T> = T | T[] | null;
const one = <T,>(v: One<T>): T | null => (Array.isArray(v) ? (v[0] ?? null) : v);

export async function loadRecords(period: Period): Promise<PaymentRecord[]> {
  const service = createServiceRoleClient();
  let payQuery = service
    .from("payments")
    .select("id, invoice_id, amount, paid_on, payment_type, notes, method, invoices(invoice_number, currency, clients(company_name), projects(name))")
    .order("paid_on", { ascending: false })
    .limit(1000);
  let expQuery = service
    .from("expenses")
    .select("id, category, amount, currency, expense_date, vendor, description, expense_type, recurring_parent_id, projects(name)")
    .order("expense_date", { ascending: false })
    .limit(1000);
  if (period.from) {
    payQuery = payQuery.gte("paid_on", period.from);
    expQuery = expQuery.gte("expense_date", period.from);
  }
  if (period.to) {
    payQuery = payQuery.lte("paid_on", period.to);
    expQuery = expQuery.lte("expense_date", period.to);
  }
  const [{ data: payments }, { data: expenses }] = await Promise.all([payQuery, expQuery]);

  const received: PaymentRecord[] = (payments ?? []).map((p) => {
    const inv = one(p.invoices as One<{ invoice_number: string; currency: Currency; clients: One<{ company_name: string }>; projects: One<{ name: string }> }>);
    const client = one(inv?.clients ?? null)?.company_name;
    const project = one(inv?.projects ?? null)?.name;
    return {
      id: p.id,
      kind: "received",
      date: p.paid_on,
      title: project || client || inv?.invoice_number || "Payment",
      subtitle: [client && project ? client : null, inv?.invoice_number, p.notes].filter(Boolean).join(" · "),
      amount: Number(p.amount),
      currency: inv?.currency ?? "PKR",
      tag: p.payment_type ? p.payment_type[0].toUpperCase() + p.payment_type.slice(1) : null,
      deleteUrl: `/api/admin/invoices/${p.invoice_id}/payments/${p.id}`,
    };
  });

  const paidOut: PaymentRecord[] = (expenses ?? []).map((e) => ({
    id: e.id,
    kind: "paid_out",
    date: e.expense_date,
    title: e.description || e.vendor || e.category,
    subtitle: [e.vendor && e.description ? e.vendor : null, one(e.projects as One<{ name: string }>)?.name, e.recurring_parent_id || e.expense_type === "monthly" ? "Auto" : null].filter(Boolean).join(" · "),
    amount: Number(e.amount),
    currency: (e.currency as Currency) ?? "PKR",
    tag: e.category,
    deleteUrl: `/api/admin/expenses/${e.id}`,
  }));

  return [...received, ...paidOut].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export async function totalsPKR(records: PaymentRecord[]) {
  const rates = await getExchangeRates();
  const sum = (kind: PaymentRecord["kind"]) => sumToPKR(records.filter((r) => r.kind === kind).map((r) => ({ amount: r.amount, currency: r.currency })), rates);
  const received = sum("received");
  const paidOut = sum("paid_out");
  return { received, paidOut, net: received - paidOut };
}

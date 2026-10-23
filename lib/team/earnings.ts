import { createServiceRoleClient } from "@/lib/supabase/service";
import { getExchangeRates } from "@/lib/admin/exchange-rates";
import { sumToPKR } from "@/lib/currency";
import { todayInPkt } from "@/lib/availability";
import type { Currency } from "@/lib/invoices";

export interface Payout {
  id: string;
  date: string;
  title: string;
  project: string | null;
  amount: number;
  currency: Currency;
}

export interface Earnings {
  payouts: Payout[];
  /** PKR-equivalent totals. */
  thisMonth: number;
  total: number;
  last: Payout | null;
  /** Monthly salary still unpaid this month (0 when not on a monthly salary, or already paid). */
  pending: number;
  salary: { amount: number; currency: Currency } | null;
}

/** A team member's own pay: payouts recorded against them in Payments, plus what's left of this month's salary. */
export async function getEarnings(employeeId: string): Promise<Earnings> {
  const service = createServiceRoleClient();
  const [{ data: expenses }, { data: employee }, rates] = await Promise.all([
    service
      .from("expenses")
      .select("id, expense_date, description, vendor, amount, currency, projects(name)")
      .eq("employee_id", employeeId)
      .order("expense_date", { ascending: false })
      .limit(500),
    service.from("employees").select("pay_basis, pay_amount, pay_currency").eq("id", employeeId).maybeSingle(),
    getExchangeRates(),
  ]);

  const payouts: Payout[] = (expenses ?? []).map((e) => {
    const project = Array.isArray(e.projects) ? e.projects[0] : e.projects;
    return {
      id: e.id,
      date: e.expense_date,
      title: e.description || e.vendor || "Payment",
      project: (project as { name: string } | null)?.name ?? null,
      amount: Number(e.amount),
      currency: (e.currency as Currency) ?? "PKR",
    };
  });

  const month = todayInPkt().slice(0, 7);
  const toPkr = (rows: Payout[]) => sumToPKR(rows.map((p) => ({ amount: p.amount, currency: p.currency })), rates);
  const monthRows = payouts.filter((p) => p.date.startsWith(month));
  const thisMonth = toPkr(monthRows);

  const salary = employee?.pay_basis === "monthly" && employee.pay_amount ? { amount: Number(employee.pay_amount), currency: (employee.pay_currency as Currency) ?? "PKR" } : null;
  const salaryPkr = salary ? sumToPKR([{ amount: salary.amount, currency: salary.currency }], rates) : 0;

  return {
    payouts,
    thisMonth,
    total: toPkr(payouts),
    last: payouts[0] ?? null,
    pending: Math.max(0, salaryPkr - thisMonth),
    salary,
  };
}

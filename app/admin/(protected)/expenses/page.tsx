import Link from "next/link";
import { CalendarDays, PieChart, Receipt, Wallet } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { Expense } from "@/lib/expenses";
import { formatMoney } from "@/lib/invoices";
import { convertToPKR } from "@/lib/currency";
import { getExchangeRates } from "@/lib/admin/exchange-rates";
import { currentMonthKey, monthKeyOf, monthLabel, percentChange, shiftMonth } from "@/lib/finance";
import { PageHeader, StatCard } from "@/components/admin/ui";
import ExpenseFormModal from "@/components/admin/expenses/ExpenseFormModal";
import ExpensesTable from "@/components/admin/expenses/ExpensesTable";

export const dynamic = "force-dynamic";

export default async function AdminExpensesPage() {
  const supabase = createServiceRoleClient();
  const [{ data }, rates, { data: employeesData }] = await Promise.all([
    supabase.from("expenses").select("*").order("expense_date", { ascending: false }).limit(500),
    getExchangeRates(),
    // Active employees only — someone no longer with the company shouldn't
    // be offered as a fresh salary-expense target going forward (an
    // existing expense already tagged with their name still shows fine,
    // see VendorOrEmployeeField's fallback-option handling).
    supabase.from("employees").select("id, name").eq("status", "active").order("name"),
  ]);

  const expenses = (data ?? []) as Expense[];
  const employees = (employeesData ?? []) as { id: string; name: string }[];

  // Totals are converted to PKR (the business's standard currency) so months
  // can be compared; each row in the table keeps its own real currency.
  const thisMonth = currentMonthKey();
  const lastMonth = shiftMonth(thisMonth, -1);
  const thisYear = thisMonth.slice(0, 4);

  const inPKR = (expense: Expense) => convertToPKR(Number(expense.amount), expense.currency, rates);
  const sumWhere = (predicate: (expense: Expense) => boolean) =>
    expenses.filter(predicate).reduce((total, expense) => total + inPKR(expense), 0);

  const thisMonthTotal = sumWhere((e) => monthKeyOf(e.expense_date) === thisMonth);
  const lastMonthTotal = sumWhere((e) => monthKeyOf(e.expense_date) === lastMonth);
  const yearTotal = sumWhere((e) => e.expense_date.startsWith(thisYear));

  const byCategory = new Map<string, number>();
  for (const expense of expenses.filter((e) => e.expense_date.startsWith(thisYear))) {
    byCategory.set(expense.category, (byCategory.get(expense.category) ?? 0) + inPKR(expense));
  }
  const topCategory = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0];

  const change = percentChange(thisMonthTotal, lastMonthTotal);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        subtitle={
          <>
            {expenses.length} record{expenses.length === 1 ? "" : "s"} · feeds the{" "}
            <Link href="/admin/finance" className="font-medium text-[#1A14A5] hover:underline">
              P&amp;L report
            </Link>
          </>
        }
        actions={<ExpenseFormModal employees={employees} />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={monthLabel(thisMonth, { withYear: true })}
          value={formatMoney(thisMonthTotal, "PKR")}
          icon={Wallet}
          valueColor="#9F1239"
          iconBg="#E11D48"
          // Spending more is the unfavourable direction, so the arrow is inverted.
          delta={
            change === null
              ? undefined
              : {
                  value: `${change > 0 ? "+" : ""}${change}%`,
                  direction: change === 0 ? "flat" : change > 0 ? "down" : "up",
                  label: " vs last month",
                }
          }
          description="Spent this month"
        />
        <StatCard
          label={monthLabel(lastMonth, { withYear: true })}
          value={formatMoney(lastMonthTotal, "PKR")}
          icon={CalendarDays}
          iconBg="#7c3aed"
          description="Previous month"
        />
        <StatCard
          label={`${thisYear} total`}
          value={formatMoney(yearTotal, "PKR")}
          icon={Receipt}
          iconBg="#1A14A5"
          description="Year to date"
        />
        <StatCard
          label="Biggest category"
          value={topCategory ? topCategory[0] : "—"}
          icon={PieChart}
          iconBg="#0d9488"
          description={topCategory ? `${formatMoney(topCategory[1], "PKR")} this year` : "Nothing recorded yet"}
        />
      </div>

      <ExpensesTable expenses={expenses} employees={employees} />
    </div>
  );
}

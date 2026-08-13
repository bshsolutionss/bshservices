import { createServiceRoleClient } from "@/lib/supabase/service";
import { EXPENSE_CATEGORY_COLORS, type Expense, type ExpenseCategory } from "@/lib/expenses";
import { formatMoney, formatByCurrency } from "@/lib/invoices";
import NewExpenseInlineForm from "@/components/admin/NewExpenseInlineForm";
import DeleteExpenseButton from "@/components/admin/DeleteExpenseButton";

export const dynamic = "force-dynamic";

export default async function AdminExpensesPage() {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false })
    .limit(300);

  const expenses = (data ?? []) as Expense[];

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const startOfMonthStr = startOfMonth.toISOString().slice(0, 10);
  const thisMonthTotal = formatByCurrency(
    expenses.filter((e) => e.expense_date >= startOfMonthStr).map((e) => ({ amount: e.amount, currency: e.currency }))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-[#231F20]">Expenses</h1>
          <p className="text-[#231F20]/60 text-sm mt-1">
            {expenses.length} expense{expenses.length === 1 ? "" : "s"} &middot; {thisMonthTotal} this month
          </p>
        </div>
        <NewExpenseInlineForm />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1A14A5]/10 text-left text-[#231F20]/50">
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Vendor</th>
              <th className="px-6 py-3 font-medium">Description</th>
              <th className="px-6 py-3 font-medium">Amount</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A14A5]/5">
            {expenses.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-[#231F20]/50">
                  No expenses recorded yet.
                </td>
              </tr>
            )}
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-[#F4F7FE] transition">
                <td className="px-6 py-4 text-[#231F20]/70 whitespace-nowrap">
                  {new Date(expense.expense_date + "T00:00:00Z").toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </td>
                <td className="px-6 py-4">
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{
                      background: EXPENSE_CATEGORY_COLORS[expense.category as ExpenseCategory].bg,
                      color: EXPENSE_CATEGORY_COLORS[expense.category as ExpenseCategory].text,
                    }}
                  >
                    {expense.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-[#231F20]/70">{expense.vendor || "—"}</td>
                <td className="px-6 py-4 text-[#231F20]/70">{expense.description || "—"}</td>
                <td className="px-6 py-4 font-medium text-[#231F20]">{formatMoney(expense.amount, expense.currency)}</td>
                <td className="px-6 py-4">
                  <DeleteExpenseButton id={expense.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

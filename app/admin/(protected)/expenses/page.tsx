import { createServiceRoleClient } from "@/lib/supabase/service";
import type { Expense } from "@/lib/expenses";
import { formatByCurrency } from "@/lib/invoices";
import NewExpenseInlineForm from "@/components/admin/NewExpenseInlineForm";
import ExpenseRow from "@/components/admin/ExpenseRow";

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
              <ExpenseRow key={expense.id} expense={expense} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

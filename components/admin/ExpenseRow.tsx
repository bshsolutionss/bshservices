"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_COLORS, type Expense, type ExpenseCategory } from "@/lib/expenses";
import { CURRENCIES, CURRENCY_LABELS, formatMoney, type Currency } from "@/lib/invoices";

/** Table row for the expenses list — display + inline edit toggle + delete, one component per row. */
export default function ExpenseRow({ expense }: { expense: Expense }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState<ExpenseCategory>(expense.category);
  const [amount, setAmount] = useState(String(expense.amount));
  const [currency, setCurrency] = useState<Currency>(expense.currency);
  const [expenseDate, setExpenseDate] = useState(expense.expense_date);
  const [vendor, setVendor] = useState(expense.vendor ?? "");
  const [description, setDescription] = useState(expense.description ?? "");

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/expenses/${expense.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          amount: Number(amount),
          currency,
          expense_date: expenseDate,
          vendor: vendor || null,
          description: description || null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Failed to save.");
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save expense.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Remove this expense?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/expenses/${expense.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setDeleting(false);
      alert("Failed to remove expense.");
    }
  };

  if (editing) {
    return (
      <tr className="bg-[#F4F7FE]">
        <td colSpan={6} className="px-6 py-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="rounded-lg border border-[#1A14A5]/20 px-3 py-2 text-sm bg-white"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="rounded-lg border border-[#1A14A5]/20 px-3 py-2 text-sm bg-white"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {CURRENCY_LABELS[c]}
                </option>
              ))}
            </select>
            <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} />
            <Input placeholder="Vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} />
            <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="flex items-center gap-3 mt-3">
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-xl text-sm h-8 px-3"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditing(false)}
              className="rounded-xl text-sm h-8 px-3"
            >
              Cancel
            </Button>
            {error && <span className="text-sm text-red-600">❌ {error}</span>}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-[#F4F7FE] transition">
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
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-sm font-semibold text-[#1A14A5] hover:underline"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm text-red-600 hover:underline disabled:opacity-50"
          >
            {deleting ? "Removing..." : "Remove"}
          </button>
        </div>
      </td>
    </tr>
  );
}

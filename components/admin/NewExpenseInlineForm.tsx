"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/lib/expenses";
import { CURRENCIES, CURRENCY_LABELS, type Currency } from "@/lib/invoices";
import VendorOrEmployeeField from "@/components/admin/VendorOrEmployeeField";

export default function NewExpenseInlineForm({ employees = [] }: { employees?: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>("Office");
  const [amount, setAmount] = useState("");
  // PKR is the business's standard currency — still freely changeable per expense.
  const [currency, setCurrency] = useState<Currency>("PKR");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [vendor, setVendor] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          amount: Number(amount),
          currency,
          expense_date: expenseDate,
          vendor: vendor || undefined,
          description: description || undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Failed to save expense.");

      setAmount("");
      setVendor("");
      setDescription("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save expense.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-xl">
        + New Expense
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#1A14A5]/10 p-5 grid sm:grid-cols-2 gap-3">
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
      <Input type="number" min="0" step="0.01" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      <Input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} required />
      <VendorOrEmployeeField category={category} value={vendor} onChange={setVendor} employees={employees} />
      <Input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />

      <div className="sm:col-span-2 flex items-center gap-3">
        <Button type="submit" disabled={saving} className="bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-xl">
          {saving ? "Saving..." : "Add Expense"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
          Cancel
        </Button>
        {error && <span className="text-sm text-red-600">❌ {error}</span>}
      </div>
    </form>
  );
}

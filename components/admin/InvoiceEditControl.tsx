"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CURRENCIES, CURRENCY_LABELS, type Currency } from "@/lib/invoices";

interface InvoiceEditControlProps {
  invoiceId: string;
  initialAmount: number;
  initialTax: number;
  initialDiscount: number;
  initialCurrency: Currency;
  initialDueDate: string | null;
  initialNotes: string | null;
  hasPayments: boolean;
}

export default function InvoiceEditControl({
  invoiceId,
  initialAmount,
  initialTax,
  initialDiscount,
  initialCurrency,
  initialDueDate,
  initialNotes,
  hasPayments,
}: InvoiceEditControlProps) {
  const router = useRouter();
  const [amount, setAmount] = useState(String(initialAmount));
  const [tax, setTax] = useState(String(initialTax));
  const [discount, setDiscount] = useState(String(initialDiscount));
  const [currency, setCurrency] = useState<Currency>(initialCurrency);
  const [dueDate, setDueDate] = useState(initialDueDate ?? "");
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          tax: tax === "" ? 0 : Number(tax),
          discount: discount === "" ? 0 : Number(discount),
          currency,
          due_date: dueDate || null,
          notes: notes || null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Save failed");

      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save invoice.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-[#231F20]/70 block mb-1.5">Amount</label>
          <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-[#231F20]/70 block mb-1.5">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="w-full rounded-lg border border-[#1A14A5]/20 px-3 py-2 text-sm bg-white"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {CURRENCY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-[#231F20]/70 block mb-1.5">Tax</label>
          <Input type="number" min="0" step="0.01" value={tax} onChange={(e) => setTax(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-[#231F20]/70 block mb-1.5">Discount</label>
          <Input type="number" min="0" step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-[#231F20]/70 block mb-1.5">Due Date</label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-[#231F20]/70 block mb-1.5">Notes</label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Optional notes..." />
      </div>

      {hasPayments && (
        <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
          This invoice already has payments recorded. Changing the amount, tax, or discount does not change or convert
          existing payments — the status will be recalculated against the new total.
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-xl">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        {saved && <span className="text-sm text-green-600">✅ Saved</span>}
      </div>
      {error && <p className="text-sm text-red-600">❌ {error}</p>}
    </div>
  );
}

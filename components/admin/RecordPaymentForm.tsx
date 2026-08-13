"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, formatMoney, type Currency, type PaymentMethod } from "@/lib/invoices";

interface RecordPaymentFormProps {
  invoiceId: string;
  remainingBalance: number;
  currency: Currency;
}

export default function RecordPaymentForm({ invoiceId, remainingBalance, currency }: RecordPaymentFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState(remainingBalance > 0 ? String(remainingBalance) : "");
  const [paidOn, setPaidOn] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState<PaymentMethod>("bank_transfer");
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), paid_on: paidOn, method, reference }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Failed to record payment.");

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record payment.");
    } finally {
      setSaving(false);
    }
  };

  if (remainingBalance <= 0) {
    return <p className="text-sm text-green-600">✅ This invoice is fully paid.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-xs text-[#231F20]/50">
        Remaining balance: <span className="font-semibold text-[#231F20]">{formatMoney(remainingBalance, currency)}</span>
      </p>
      <div>
        <label className="text-sm font-medium text-[#231F20]/70 block mb-1.5">Amount ({currency})</label>
        <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      </div>
      <div>
        <label className="text-sm font-medium text-[#231F20]/70 block mb-1.5">Date</label>
        <Input type="date" value={paidOn} onChange={(e) => setPaidOn(e.target.value)} required />
      </div>
      <div>
        <label className="text-sm font-medium text-[#231F20]/70 block mb-1.5">Method</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as PaymentMethod)}
          className="w-full rounded-lg border border-[#1A14A5]/20 px-3 py-2 text-sm bg-white"
        >
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>
              {PAYMENT_METHOD_LABELS[m]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-[#231F20]/70 block mb-1.5">Reference (optional)</label>
        <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Transaction ID, cheque #..." />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" disabled={saving} className="bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-xl">
          {saving ? "Recording..." : "Record Payment"}
        </Button>
        {error && <span className="text-sm text-red-600">❌ {error}</span>}
      </div>
    </form>
  );
}

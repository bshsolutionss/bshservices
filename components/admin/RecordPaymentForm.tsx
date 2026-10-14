"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, SelectField, TextField, btnPrimary } from "@/components/admin/ui";
import {
  formatMoney,
  type Currency,
  type PaymentMethod,
} from "@/lib/invoices";
import { useOptions } from "@/lib/admin/use-options";

interface RecordPaymentFormProps {
  invoiceId: string;
  remainingBalance: number;
  currency: Currency;
}

export default function RecordPaymentForm({ invoiceId, remainingBalance, currency }: RecordPaymentFormProps) {
  const router = useRouter();
  const methods = useOptions("payment_methods");
  const [amount, setAmount] = useState(remainingBalance > 0 ? String(remainingBalance) : "");
  const [paidOn, setPaidOn] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState<PaymentMethod>("bank_transfer");
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      setError("Enter a positive amount.");
      return;
    }
    if (Number(amount) > remainingBalance) {
      setError(`That is more than the ${formatMoney(remainingBalance, currency)} still outstanding.`);
      return;
    }

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
      setReference("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record payment.");
    } finally {
      setSaving(false);
    }
  };

  if (remainingBalance <= 0) {
    return <Alert tone="success">This invoice is fully paid.</Alert>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-[#231F20]/50">
        Outstanding:{" "}
        <span className="font-semibold text-[#231F20]">{formatMoney(remainingBalance, currency)}</span>
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="payment-amount"
          label={`Amount (${currency})`}
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={setAmount}
          required
        />
        <TextField id="payment-date" label="Received on" type="date" value={paidOn} onChange={setPaidOn} required />
        <SelectField
          id="payment-method"
          label="Method"
          value={method}
          onChange={(v) => setMethod(v as PaymentMethod)}
          options={methods.selectOptions}
        />
        <TextField
          id="payment-reference"
          label="Reference"
          value={reference}
          onChange={setReference}
          placeholder="Transaction ID, cheque no…"
        />
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <button type="submit" disabled={saving} className={btnPrimary}>
        {saving ? "Recording…" : "Record payment"}
      </button>
    </form>
  );
}

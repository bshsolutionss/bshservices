"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Alert, ConfirmButton, EmptyState, TextField, btnPrimary } from "@/components/admin/ui";
import { formatDate, formatMoney, type Currency } from "@/lib/invoices";
import type { InvestmentReturn } from "@/lib/investments";

/** Income received from an investment - add and remove entries. */
export default function InvestmentReturns({
  investmentId,
  currency,
  returns,
}: {
  investmentId: string;
  currency: Currency;
  returns: InvestmentReturn[];
}) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) return setError("Enter an amount greater than zero.");
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/investments/${investmentId}/returns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), received_on: date, note: note.trim() || undefined }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not record the return.");
      setAmount("");
      setNote("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record the return.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="flex flex-wrap items-end gap-3 rounded-xl bg-[#F4F7FE] p-3">
        <div className="w-36">
          <TextField id="ret-amount" label={`Amount (${currency})`} type="number" min="0" step="0.01" value={amount} onChange={setAmount} />
        </div>
        <div className="w-40">
          <TextField id="ret-date" label="Received on" type="date" value={date} onChange={setDate} />
        </div>
        <div className="min-w-[160px] flex-1">
          <TextField id="ret-note" label="Note" value={note} onChange={setNote} placeholder="Dividend, rent, profit share…" />
        </div>
        <button type="submit" disabled={saving} className={btnPrimary}>
          <Plus className="h-4 w-4" />
          {saving ? "Adding…" : "Add"}
        </button>
      </form>
      {error && <Alert tone="error">{error}</Alert>}

      {returns.length === 0 ? (
        <EmptyState title="No returns recorded" description="Add dividends, rent or profit shares as you receive them." />
      ) : (
        <ul className="divide-y divide-[#1A14A5]/5">
          {returns.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <div className="min-w-0">
                <span className="font-semibold text-emerald-700">+{formatMoney(r.amount, currency)}</span>
                {r.note && <span className="text-[#231F20]/50"> · {r.note}</span>}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-[#231F20]/40">{formatDate(r.received_on)}</span>
                <ConfirmButton
                  label=""
                  display="inline"
                  icon={<Trash2 className="h-4 w-4" />}
                  title="Delete this return?"
                  confirmLabel="Delete"
                  message="It will no longer count towards this investment's gain."
                  onConfirm={async () => {
                    const res = await fetch(`/api/admin/investments/${investmentId}/returns/${r.id}`, { method: "DELETE" });
                    const body = await res.json().catch(() => ({}));
                    if (!res.ok) throw new Error(body.error || "Could not delete.");
                    router.refresh();
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

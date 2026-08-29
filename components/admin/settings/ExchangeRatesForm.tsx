"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CURRENCY_LABELS, type Currency } from "@/lib/invoices";
import type { ExchangeRates } from "@/lib/currency";

const EDITABLE_CURRENCIES: Currency[] = ["USD", "CAD", "AUD"];

export default function ExchangeRatesForm({ rates: initialRates }: { rates: ExchangeRates }) {
  const router = useRouter();
  const [rates, setRates] = useState<Record<Currency, string>>(() => ({
    USD: String(initialRates.USD),
    CAD: String(initialRates.CAD),
    AUD: String(initialRates.AUD),
    PKR: "1",
  }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const payload = {
        rates: Object.fromEntries(EDITABLE_CURRENCIES.map((c) => [c, Number(rates[c])])),
      };
      const res = await fetch("/api/admin/settings/exchange-rates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Failed to save rates.");

      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save rates.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 p-6 max-w-xl space-y-5">
      <div>
        <label className="text-sm font-medium text-[#231F20]/70 block mb-1.5">{CURRENCY_LABELS.PKR}</label>
        <div className="flex items-center gap-3">
          <Input value="1" disabled className="max-w-[160px] bg-[#F4F7FE]" />
          <span className="text-xs text-[#231F20]/50">Base currency — always 1:1 with itself.</span>
        </div>
      </div>

      {EDITABLE_CURRENCIES.map((currency) => (
        <div key={currency}>
          <label className="text-sm font-medium text-[#231F20]/70 block mb-1.5">{CURRENCY_LABELS[currency]}</label>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#231F20]/50 w-8">1 {currency} =</span>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={rates[currency]}
              onChange={(e) => setRates((prev) => ({ ...prev, [currency]: e.target.value }))}
              className="max-w-[160px]"
            />
            <span className="text-sm text-[#231F20]/50">PKR</span>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={saving} className="bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-xl">
          {saving ? "Saving..." : "Save Rates"}
        </Button>
        {saved && <span className="text-sm text-green-600">✅ Saved</span>}
        {error && <span className="text-sm text-red-600">❌ {error}</span>}
      </div>
    </div>
  );
}

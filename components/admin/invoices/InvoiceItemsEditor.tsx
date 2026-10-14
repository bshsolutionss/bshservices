"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ListPlus, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, TextField, btnPrimary, btnSecondary, inputBase } from "@/components/admin/ui";
import {
  computeInvoiceTotals,
  formatMoney,
  type Currency,
  type InvoiceItem,
} from "@/lib/invoices";

interface LineDraft {
  key: string;
  description: string;
  quantity: string;
  unit_price: string;
}

let lineCounter = 0;
const newLine = (description = "", quantity = "1", unit_price = ""): LineDraft => ({
  key: `row-${++lineCounter}`,
  description,
  quantity,
  unit_price,
});

interface InvoiceItemsEditorProps {
  invoiceId: string;
  currency: Currency;
  items: InvoiceItem[];
  taxRate: number;
  /** The saved absolute tax, so the read-only summary is exact even for a flat (non-percentage) tax. */
  tax: number;
  discount: number;
  /** The saved subtotal — also what a legacy, never-itemised invoice was billed at. */
  amount: number;
  /** Warn before changing a total that already has money against it. */
  hasPayments: boolean;
}

/**
 * The invoice's contents, edited in place: line items plus the tax rate and
 * discount that act on them. They live in one card because they produce one
 * number — splitting them across two forms (as before) meant the total on
 * screen could disagree with either form's unsaved state.
 *
 * Saving sends the lines as a whole list (PUT …/items) and the rate/discount
 * on the invoice itself (PATCH …), then lets the server-computed totals come
 * back via refresh — the figures below are a preview, never the source.
 */
export default function InvoiceItemsEditor({
  invoiceId,
  currency,
  items,
  taxRate,
  tax,
  discount,
  amount,
  hasPayments,
}: InvoiceItemsEditorProps) {
  const router = useRouter();
  const itemised = items.length > 0;

  const [editing, setEditing] = useState(false);
  const [lines, setLines] = useState<LineDraft[]>(() =>
    itemised
      ? items.map((item) => newLine(item.description, String(item.quantity), String(item.unit_price)))
      : [newLine("Professional services", "1", amount > 0 ? String(amount) : "")]
  );
  const [rate, setRate] = useState(String(taxRate ?? 0));
  const [discountValue, setDiscountValue] = useState(String(discount ?? 0));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totals = computeInvoiceTotals(lines, rate, discountValue);

  const updateLine = (key: string, patch: Partial<LineDraft>) =>
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...patch } : line)));

  const removeLine = (key: string) =>
    setLines((current) => (current.length === 1 ? current : current.filter((line) => line.key !== key)));

  const cancel = () => {
    setLines(
      itemised
        ? items.map((item) => newLine(item.description, String(item.quantity), String(item.unit_price)))
        : [newLine("Professional services", "1", amount > 0 ? String(amount) : "")]
    );
    setRate(String(taxRate ?? 0));
    setDiscountValue(String(discount ?? 0));
    setError(null);
    setEditing(false);
  };

  const save = async () => {
    const payloadItems = lines
      .filter((line) => line.description.trim())
      .map((line) => ({
        description: line.description.trim(),
        quantity: Number(line.quantity) || 1,
        unit_price: Number(line.unit_price) || 0,
      }));

    if (payloadItems.length === 0) {
      setError("Add at least one line with a description.");
      return;
    }
    if (totals.subtotal <= 0) {
      setError("The subtotal must be greater than zero.");
      return;
    }
    if (totals.total < 0) {
      setError("The discount is larger than the invoice.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const itemsRes = await fetch(`/api/admin/invoices/${invoiceId}/items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payloadItems }),
      });
      const itemsBody = await itemsRes.json().catch(() => ({}));
      if (!itemsRes.ok) throw new Error(itemsBody.error || "Could not save the line items.");

      const invoiceRes = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tax_rate: Number(rate) || 0, discount: Number(discountValue) || 0 }),
      });
      const invoiceBody = await invoiceRes.json().catch(() => ({}));
      if (!invoiceRes.ok) throw new Error(invoiceBody.error || "Could not save tax and discount.");

      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the invoice contents.");
    } finally {
      setSaving(false);
    }
  };

  /* ───────────────── read-only view ───────────────── */

  if (!editing) {
    return (
      <div className="space-y-4">
        {itemised ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-[#231F20]/45">
                <tr className="border-b border-[#1A14A5]/10">
                  <th className="pb-2 pr-3 font-semibold">Description</th>
                  <th className="w-20 pb-2 pr-3 font-semibold">Qty</th>
                  <th className="w-32 pb-2 pr-3 font-semibold">Unit price</th>
                  <th className="w-32 pb-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A14A5]/5">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 pr-3 text-[#231F20]">{item.description}</td>
                    <td className="py-2.5 pr-3 text-[#231F20]/60">{Number(item.quantity)}</td>
                    <td className="py-2.5 pr-3 text-[#231F20]/60">{formatMoney(item.unit_price, currency)}</td>
                    <td className="py-2.5 text-right font-semibold text-[#231F20]">
                      {formatMoney(item.line_total, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Alert tone="info" title="Not itemised">
            This invoice was billed as a single amount of {formatMoney(amount, currency)}. Add line items to show the
            client what they are paying for — the total stays yours to control.
          </Alert>
        )}

        <Summary subtotal={amount} taxRate={taxRate} tax={tax} discount={discount} currency={currency} />

        <button type="button" onClick={() => setEditing(true)} className={btnSecondary}>
          {itemised ? (
            <>
              <Plus className="h-4 w-4" /> Edit line items
            </>
          ) : (
            <>
              <ListPlus className="h-4 w-4" /> Add line items
            </>
          )}
        </button>
      </div>
    );
  }

  /* ───────────────── edit view ───────────────── */

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-[#1A14A5]/10">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-[#F4F7FE] text-left text-xs uppercase tracking-wide text-[#231F20]/50">
            <tr>
              <th className="px-3 py-2 font-semibold">Description</th>
              <th className="w-20 px-3 py-2 font-semibold">Qty</th>
              <th className="w-32 px-3 py-2 font-semibold">Unit price</th>
              <th className="w-28 px-3 py-2 text-right font-semibold">Total</th>
              <th className="w-10 px-2 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A14A5]/5">
            {lines.map((line) => (
              <tr key={line.key}>
                <td className="px-3 py-2">
                  <input
                    value={line.description}
                    onChange={(e) => updateLine(line.key, { description: e.target.value })}
                    placeholder="What are you billing for?"
                    className={cn(inputBase, "border-transparent bg-transparent px-2 py-1.5")}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={line.quantity}
                    onChange={(e) => updateLine(line.key, { quantity: e.target.value })}
                    className={cn(inputBase, "border-transparent bg-transparent px-2 py-1.5")}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.unit_price}
                    onChange={(e) => updateLine(line.key, { unit_price: e.target.value })}
                    className={cn(inputBase, "border-transparent bg-transparent px-2 py-1.5")}
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-right font-semibold text-[#231F20]">
                  {formatMoney((Number(line.quantity) || 0) * (Number(line.unit_price) || 0), currency)}
                </td>
                <td className="px-2 py-2">
                  <button
                    type="button"
                    onClick={() => removeLine(line.key)}
                    disabled={lines.length === 1}
                    aria-label="Remove line"
                    className="rounded-lg p-1.5 text-[#231F20]/35 transition hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" onClick={() => setLines((c) => [...c, newLine()])} className={btnSecondary}>
        <Plus className="h-4 w-4" /> Add line
      </button>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-4">
          <TextField
            id="items-tax-rate"
            label="Tax rate (%)"
            type="number"
            min="0"
            step="0.01"
            value={rate}
            onChange={setRate}
          />
          <TextField
            id="items-discount"
            label={`Discount (${currency})`}
            type="number"
            min="0"
            step="0.01"
            value={discountValue}
            onChange={setDiscountValue}
          />
        </div>
        <Summary
          subtotal={totals.subtotal}
          taxRate={Number(rate) || 0}
          tax={totals.tax}
          discount={totals.discount}
          currency={currency}
        />
      </div>

      {hasPayments && (
        <Alert tone="warning">
          Payments are already recorded against this invoice. Changing the total does not change those payments — the
          status is recalculated against the new total.
        </Alert>
      )}
      {error && <Alert tone="error">{error}</Alert>}

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={save} disabled={saving} className={btnPrimary}>
          {saving ? "Saving…" : "Save contents"}
        </button>
        <button type="button" onClick={cancel} className={btnSecondary}>
          Cancel
        </button>
      </div>
    </div>
  );
}

/** Subtotal → tax → discount → total. Falls back to deriving tax from the rate if no absolute amount is given. */
function Summary({
  subtotal,
  taxRate,
  tax,
  discount,
  currency,
}: {
  subtotal: number;
  taxRate: number;
  tax?: number;
  discount: number;
  currency: Currency;
}) {
  const taxAmount = tax ?? Math.round(((subtotal * taxRate) / 100) * 100) / 100;
  const total = Math.round((subtotal + taxAmount - discount) * 100) / 100;

  return (
    <dl className="space-y-1.5 rounded-xl bg-[#F4F7FE] p-4 text-sm">
      <div className="flex items-center justify-between">
        <dt className="text-[#231F20]/55">Subtotal</dt>
        <dd className="font-semibold text-[#231F20]">{formatMoney(subtotal, currency)}</dd>
      </div>
      <div className="flex items-center justify-between">
        <dt className="text-[#231F20]/55">Tax {taxRate > 0 ? `(${taxRate}%)` : ""}</dt>
        <dd className="font-semibold text-[#231F20]">{formatMoney(taxAmount, currency)}</dd>
      </div>
      <div className="flex items-center justify-between">
        <dt className="text-[#231F20]/55">Discount</dt>
        <dd className="font-semibold text-[#231F20]">−{formatMoney(discount, currency)}</dd>
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-[#1A14A5]/10 pt-2">
        <dt className="font-bold text-[#231F20]">Total</dt>
        <dd className="text-lg font-extrabold text-[#1A14A5]">{formatMoney(total, currency)}</dd>
      </div>
    </dl>
  );
}

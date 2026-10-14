"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import {
  Alert,
  Modal,
  MoneyField,
  SelectField,
  TextField,
  TextareaField,
  btnGhost,
  btnPrimary,
  btnSecondary,
} from "@/components/admin/ui";
import { INVESTMENT_STATUSES, INVESTMENT_STATUS_LABELS, type Investment, type InvestmentStatus } from "@/lib/investments";
import { CURRENCIES, type Currency } from "@/lib/invoices";
import { useOptions } from "@/lib/admin/use-options";

/** Add or edit an investment. The type list is editable in Settings > Lists. */
export default function InvestmentFormModal({ investment, defaultCurrency = "PKR" }: { investment?: Investment; defaultCurrency?: Currency }) {
  const router = useRouter();
  const editing = !!investment;
  const types = useOptions("investment_types");

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(investment?.name ?? "");
  const [type, setType] = useState(investment?.investment_type ?? "");
  const [currency, setCurrency] = useState<Currency>(investment?.currency ?? defaultCurrency);
  const [invested, setInvested] = useState(investment ? String(investment.invested_amount) : "");
  const [value, setValue] = useState(investment ? String(investment.current_value) : "");
  const [investedOn, setInvestedOn] = useState(investment?.invested_on ?? new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<InvestmentStatus>(investment?.status ?? "active");
  const [expected, setExpected] = useState(investment?.expected_return_pct != null ? String(investment.expected_return_pct) : "");
  const [notes, setNotes] = useState(investment?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setError(null);
    if (!editing) {
      setName("");
      setType("");
      setInvested("");
      setValue("");
      setExpected("");
      setNotes("");
    }
  };

  const save = async () => {
    if (!name.trim()) return setError("Give the investment a name.");
    if (!Number.isFinite(Number(invested)) || Number(invested) < 0 || invested === "") return setError("Enter the amount invested.");
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(editing ? `/api/admin/investments/${investment!.id}` : "/api/admin/investments", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          investment_type: type || null,
          currency,
          invested_amount: Number(invested),
          current_value: value === "" ? undefined : Number(value),
          invested_on: investedOn,
          status,
          expected_return_pct: expected === "" ? null : Number(expected),
          notes: notes.trim() || null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not save.");
      close();
      if (!editing && body.id) router.push(`/admin/investments/${body.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={editing ? btnSecondary : btnPrimary}>
        {editing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {editing ? "Edit" : "Add investment"}
      </button>
      <Modal
        open={open}
        onClose={close}
        title={editing ? `Edit ${investment!.name}` : "Add investment"}
        description="Keep the current value up to date to see your real gain or loss."
        size="lg"
        footer={
          <>
            <button type="button" className={btnGhost} onClick={close}>
              Cancel
            </button>
            <button type="button" className={`${btnPrimary} ml-auto`} onClick={save} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Add investment"}
            </button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="inv-name" label="Name" required className="sm:col-span-2" value={name} onChange={setName} placeholder="e.g. Plot in DHA Phase 8" autoFocus />
          <SelectField
            id="inv-type"
            label="Type"
            value={type}
            onChange={setType}
            options={
              type && !types.options.some((o) => o.value === type)
                ? [{ value: type, label: type }, ...types.selectOptions]
                : types.selectOptions
            }
            placeholder="Select…"
          />
          <TextField id="inv-date" label="Invested on" type="date" value={investedOn} onChange={setInvestedOn} />
          <MoneyField
            id="inv-amount"
            label="Amount invested"
            required
            amount={invested}
            onAmountChange={setInvested}
            currency={currency}
            onCurrencyChange={(v) => setCurrency(v as Currency)}
            currencies={CURRENCIES}
          />
          <MoneyField
            id="inv-value"
            label="Current value"
            amount={value}
            onAmountChange={setValue}
            currency={currency}
            currencies={CURRENCIES}
            hint="Leave empty to use the amount invested."
          />
          <SelectField
            id="inv-status"
            label="Status"
            value={status}
            onChange={(v) => setStatus(v as InvestmentStatus)}
            options={INVESTMENT_STATUSES.map((s) => ({ value: s, label: INVESTMENT_STATUS_LABELS[s] }))}
          />
          <TextField
            id="inv-expected"
            label="Expected yearly return (%)"
            type="number"
            step="0.1"
            value={expected}
            onChange={setExpected}
          />
          <TextareaField id="inv-notes" label="Notes" className="sm:col-span-2" rows={2} value={notes} onChange={setNotes} />
        </div>
        {error && <Alert tone="error" className="mt-4">{error}</Alert>}
      </Modal>
    </>
  );
}

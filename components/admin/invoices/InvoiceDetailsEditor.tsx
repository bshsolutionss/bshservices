"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import {
  Alert,
  MoneyField,
  SelectField,
  TextField,
  TextareaField,
  btnPrimary,
  btnSecondary,
} from "@/components/admin/ui";
import { CURRENCIES, CURRENCY_LABELS, formatDate, formatMoney, type Currency } from "@/lib/invoices";

interface InvoiceDetailsEditorProps {
  invoiceId: string;
  currency: Currency;
  issueDate: string;
  dueDate: string | null;
  notes: string | null;
  projectId: string | null;
  /** The client's projects, so an invoice can be (re)linked to one. */
  projects: { id: string; name: string }[];
  /** When false the invoice has no line items, so its flat subtotal is editable here. */
  itemised: boolean;
  amount: number;
  /** Flat tax amount — only editable while the invoice isn't itemised and has no tax rate. */
  tax: number;
  taxRate: number;
}

/**
 * The non-money facts about an invoice: currency, dates, project link and
 * notes — plus the flat amount/tax for an invoice that was never itemised
 * (once it has line items, InvoiceItemsEditor owns those figures instead).
 */
export default function InvoiceDetailsEditor({
  invoiceId,
  currency,
  issueDate,
  dueDate,
  notes,
  projectId,
  projects,
  itemised,
  amount,
  tax,
  taxRate,
}: InvoiceDetailsEditorProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  const [currencyValue, setCurrencyValue] = useState<Currency>(currency);
  const [issue, setIssue] = useState(issueDate);
  const [due, setDue] = useState(dueDate ?? "");
  const [project, setProject] = useState(projectId ?? "");
  const [notesValue, setNotesValue] = useState(notes ?? "");
  const [amountValue, setAmountValue] = useState(String(amount));
  const [taxValue, setTaxValue] = useState(String(tax));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = () => {
    setCurrencyValue(currency);
    setIssue(issueDate);
    setDue(dueDate ?? "");
    setProject(projectId ?? "");
    setNotesValue(notes ?? "");
    setAmountValue(String(amount));
    setTaxValue(String(tax));
    setError(null);
    setEditing(false);
  };

  const save = async () => {
    if (due && due < issue) {
      setError("Due date can't be before the issue date.");
      return;
    }
    if (!itemised && (!Number.isFinite(Number(amountValue)) || Number(amountValue) <= 0)) {
      setError("Amount must be a positive number.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currency: currencyValue,
          issue_date: issue,
          due_date: due || null,
          project_id: project || null,
          notes: notesValue.trim() || null,
          // Only sent for a non-itemised invoice; otherwise the DB derives
          // the subtotal from the line items and this would fight it.
          ...(itemised ? {} : { amount: Number(amountValue), tax: Number(taxValue) || 0 }),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not save the invoice.");

      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the invoice.");
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    const linkedProject = projects.find((p) => p.id === projectId);
    return (
      <div className="space-y-4">
        <dl className="space-y-2.5 text-sm">
          <Row label="Issue date" value={formatDate(issueDate)} />
          <Row label="Due date" value={formatDate(dueDate)} />
          <Row label="Currency" value={currency} />
          <Row label="Project" value={linkedProject?.name ?? "Not linked"} />
          {!itemised && <Row label="Amount" value={formatMoney(amount, currency)} />}
        </dl>
        {notes && (
          <div className="rounded-xl bg-[#F4F7FE] px-3.5 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#231F20]/50">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-[#231F20]/75">{notes}</p>
          </div>
        )}
        <button type="button" onClick={() => setEditing(true)} className={btnSecondary}>
          <Pencil className="h-3.5 w-3.5" /> Edit details
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TextField id="invoice-issue-date" label="Issue date" type="date" value={issue} onChange={setIssue} required />
      <TextField id="invoice-due-date" label="Due date" type="date" value={due} onChange={setDue} />
      <SelectField
        id="invoice-detail-currency"
        label="Currency"
        value={currencyValue}
        onChange={(v) => setCurrencyValue(v as Currency)}
        options={CURRENCIES.map((c) => ({ value: c, label: CURRENCY_LABELS[c] }))}
      />
      <SelectField
        id="invoice-detail-project"
        label="Project"
        value={project}
        onChange={setProject}
        options={projects.map((p) => ({ value: p.id, label: p.name }))}
        placeholder="Not linked"
        hint="Links this revenue to a project for reporting."
      />

      {!itemised && (
        <>
          <MoneyField
            id="invoice-flat-amount"
            label="Amount"
            amount={amountValue}
            onAmountChange={setAmountValue}
            currency={currencyValue}
            currencies={CURRENCIES}
            hint="This invoice has no line items, so its subtotal is set here."
          />
          {taxRate === 0 && (
            <TextField
              id="invoice-flat-tax"
              label={`Tax (${currencyValue})`}
              type="number"
              min="0"
              step="0.01"
              value={taxValue}
              onChange={setTaxValue}
            />
          )}
        </>
      )}

      <TextareaField
        id="invoice-detail-notes"
        label="Notes"
        value={notesValue}
        onChange={setNotesValue}
        rows={3}
        placeholder="Appears on the PDF."
      />

      {error && <Alert tone="error">{error}</Alert>}

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={save} disabled={saving} className={btnPrimary}>
          {saving ? "Saving…" : "Save details"}
        </button>
        <button type="button" onClick={cancel} className={btnSecondary}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[#231F20]/55">{label}</dt>
      <dd className="truncate font-semibold text-[#231F20]">{value}</dd>
    </div>
  );
}

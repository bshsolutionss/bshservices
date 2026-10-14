"use client";

import { useState } from "react";
import { Alert, SectionCard, TextField, TextareaField, btnPrimary } from "@/components/admin/ui";
import type { InvoiceSettings } from "@/lib/admin/invoice-settings";

/** Defaults every new invoice starts from, plus the payment details printed on the PDF. */
export default function InvoiceSettingsForm({ initial }: { initial: InvoiceSettings }) {
  const [s, setS] = useState({
    default_tax_rate: String(initial.default_tax_rate),
    default_due_days: String(initial.default_due_days),
    default_terms: initial.default_terms,
    payment_details: initial.payment_details,
    email_message: initial.email_message,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const set = (key: keyof typeof s) => (value: string) => setS((current) => ({ ...current, [key]: value }));

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings/invoice", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...s,
          default_tax_rate: Number(s.default_tax_rate) || 0,
          default_due_days: Number(s.default_due_days) || 0,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not save.");
      setMessage({ tone: "success", text: "Saved. New invoices will use these defaults." });
    } catch (err) {
      setMessage({ tone: "error", text: err instanceof Error ? err.message : "Could not save." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Defaults" subtitle="Pre-filled on every new invoice - still editable per invoice">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="inv-tax"
            label="Default tax rate (%)"
            type="number"
            min="0"
            step="0.01"
            value={s.default_tax_rate}
            onChange={set("default_tax_rate")}
            hint="Use 0 if you don't charge tax."
          />
          <TextField
            id="inv-due"
            label="Payment due after (days)"
            type="number"
            min="0"
            step="1"
            value={s.default_due_days}
            onChange={set("default_due_days")}
            hint="0 = due on receipt."
          />
        </div>
      </SectionCard>

      <SectionCard title="Printed on the invoice PDF" subtitle="So clients know how and on what terms to pay">
        <div className="space-y-4">
          <TextareaField
            id="inv-payment"
            label="Payment details"
            rows={5}
            value={s.payment_details}
            onChange={set("payment_details")}
            placeholder={"Bank: Meezan Bank\nAccount title: BSH Solutions\nIBAN: PK00 0000 0000 0000\nEasyPaisa / JazzCash: 0300 0000000"}
          />
          <TextareaField
            id="inv-terms"
            label="Terms & conditions"
            rows={4}
            value={s.default_terms}
            onChange={set("default_terms")}
            placeholder="e.g. Work starts after the first payment. Late payments may delay delivery."
          />
        </div>
      </SectionCard>

      <SectionCard title="Invoice email" subtitle="The message pre-filled when you email an invoice to a client">
        <TextareaField id="inv-email" label="Default message" rows={3} value={s.email_message} onChange={set("email_message")} />
      </SectionCard>

      {message && <Alert tone={message.tone}>{message.text}</Alert>}
      <div className="flex justify-end">
        <button type="button" onClick={save} disabled={saving} className={btnPrimary}>
          {saving ? "Saving…" : "Save defaults"}
        </button>
      </div>
    </div>
  );
}

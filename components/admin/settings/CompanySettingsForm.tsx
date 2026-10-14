"use client";

import { useState } from "react";
import { Alert, SectionCard, SelectField, TextField, btnPrimary } from "@/components/admin/ui";
import { CURRENCIES, CURRENCY_LABELS, type Currency } from "@/lib/invoices";
import type { CompanySettings } from "@/lib/admin/company-settings";

/** The business details printed on invoices, plus the default currency for new records. */
export default function CompanySettingsForm({ initial }: { initial: CompanySettings }) {
  const [s, setS] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const set = <K extends keyof CompanySettings>(key: K) => (value: CompanySettings[K]) =>
    setS((current) => ({ ...current, [key]: value }));

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not save.");
      setMessage({ tone: "success", text: "Saved. New invoices will show these details." });
    } catch (err) {
      setMessage({ tone: "error", text: err instanceof Error ? err.message : "Could not save." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Business profile" subtitle="Printed in the From block of every invoice PDF">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="co-name" label="Business name" required value={s.name} onChange={set("name")} />
          <TextField id="co-tagline" label="Tagline" value={s.tagline} onChange={set("tagline")} />
          <TextField id="co-email" label="Email" type="email" value={s.email} onChange={set("email")} />
          <TextField id="co-phone" label="Phone" type="tel" value={s.phone} onChange={set("phone")} />
          <TextField id="co-address" label="Address" value={s.address} onChange={set("address")} />
          <TextField id="co-website" label="Website" value={s.website} onChange={set("website")} />
        </div>
      </SectionCard>

      <SectionCard title="Defaults">
        <SelectField
          id="co-currency"
          label="Default currency"
          value={s.default_currency}
          onChange={(v) => set("default_currency")(v as Currency)}
          options={CURRENCIES.map((c) => ({ value: c, label: CURRENCY_LABELS[c] }))}
          hint="Pre-selected on new invoices. Dashboard totals are still converted using your exchange rates."
        />
      </SectionCard>

      {message && <Alert tone={message.tone}>{message.text}</Alert>}
      <div className="flex justify-end">
        <button type="button" onClick={save} disabled={saving} className={btnPrimary}>
          {saving ? "Saving…" : "Save profile"}
        </button>
      </div>
    </div>
  );
}

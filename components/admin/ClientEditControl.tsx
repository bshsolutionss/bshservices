"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, ChoiceField, SectionCard, TextField, TextareaField, btnPrimary } from "@/components/admin/ui";
import { useOptions } from "@/lib/admin/use-options";
import { CLIENT_TYPES, CLIENT_TYPE_LABELS, type ClientType } from "@/lib/clients";

interface ClientEditControlProps {
  clientId: string;
  initial: {
    company_name: string;
    contact_name: string | null;
    contact_email: string;
    contact_phone: string | null;
    industry: string | null;
    account_manager: string | null;
    notes: string | null;
    client_type: ClientType;
  };
}

export default function ClientEditControl({ clientId, initial }: ClientEditControlProps) {
  const router = useRouter();
  const industries = useOptions("industries");
  const [fields, setFields] = useState({
    company_name: initial.company_name,
    contact_name: initial.contact_name ?? "",
    contact_email: initial.contact_email,
    contact_phone: initial.contact_phone ?? "",
    industry: initial.industry ?? "",
    account_manager: initial.account_manager ?? "",
    notes: initial.notes ?? "",
    client_type: initial.client_type ?? "one_time",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof fields>(key: K) => (value: (typeof fields)[K]) => {
    setSaved(false);
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!fields.company_name.trim() || !fields.contact_email.trim()) {
      setError("Company name and contact email are required.");
      return;
    }
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Save failed");

      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save client.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard title="Client profile">
      <div className="space-y-4">
        <ChoiceField
          label="Client type"
          value={fields.client_type}
          onChange={(v) => set("client_type")(v as ClientType)}
          options={CLIENT_TYPES.map((t) => ({ value: t, label: CLIENT_TYPE_LABELS[t] }))}
        />
        <TextField id="cl-company" label="Company name" required value={fields.company_name} onChange={set("company_name")} />
        <TextField id="cl-contact" label="Contact name" value={fields.contact_name} onChange={set("contact_name")} />
        <TextField
          id="cl-email"
          label="Contact email"
          type="email"
          required
          value={fields.contact_email}
          onChange={set("contact_email")}
          hint="Invoices are emailed here."
        />
        <TextField id="cl-phone" label="Phone" type="tel" value={fields.contact_phone} onChange={set("contact_phone")} />
        <TextField
          id="cl-industry"
          label="Industry"
          value={fields.industry}
          onChange={set("industry")}
          suggestions={industries.options.map((o) => o.label)}
        />
        <TextField id="cl-manager" label="Account manager" value={fields.account_manager} onChange={set("account_manager")} />
        <TextareaField id="cl-notes" label="Notes" rows={4} value={fields.notes} onChange={set("notes")} />

        <div className="flex items-center gap-3">
          <button type="button" onClick={handleSave} disabled={saving} className={btnPrimary}>
            {saving ? "Saving…" : "Save changes"}
          </button>
          {saved && <span className="text-sm font-medium text-emerald-600">Saved</span>}
        </div>
        {error && <Alert tone="error">{error}</Alert>}
      </div>
    </SectionCard>
  );
}

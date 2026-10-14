"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Alert, ChoiceField, Modal, TextField, btnGhost, btnPrimary } from "@/components/admin/ui";
import { CLIENT_TYPES, CLIENT_TYPE_LABELS, type ClientType } from "@/lib/clients";

/** Add a client by hand. (The usual path is automatic: marking a lead Won creates the client.) */
export default function ClientFormModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [clientType, setClientType] = useState<ClientType>("one_time");
  const [companyName, setCompanyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [industry, setIndustry] = useState("");
  const [accountManager, setAccountManager] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setClientType("one_time");
    setCompanyName("");
    setContactEmail("");
    setContactName("");
    setContactPhone("");
    setIndustry("");
    setAccountManager("");
    setErrors({});
    setError(null);
  };

  const save = async () => {
    const next: Record<string, string> = {};
    if (!companyName.trim()) next.companyName = "A company name is required.";
    if (!contactEmail.trim()) next.contactEmail = "A contact email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) next.contactEmail = "That isn't a valid email.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_type: clientType,
          company_name: companyName.trim(),
          contact_email: contactEmail.trim(),
          contact_name: contactName.trim() || undefined,
          contact_phone: contactPhone.trim() || undefined,
          industry: industry.trim() || undefined,
          account_manager: accountManager.trim() || undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not create the client.");

      const id = body.id;
      close();
      if (id) router.push(`/admin/clients/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the client.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={btnPrimary}>
        <Plus className="h-4 w-4" /> New client
      </button>

      <Modal
        open={open}
        onClose={close}
        title="New client"
        description="Only the company and an email are required — the rest can be filled in later."
        size="md"
        footer={
          <>
            <button type="button" className={btnGhost} onClick={close}>
              Cancel
            </button>
            <button type="button" className={`${btnPrimary} ml-auto`} onClick={save} disabled={saving}>
              {saving ? "Creating…" : "Create client"}
            </button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ChoiceField
              label="Client type"
              value={clientType}
              onChange={(v) => setClientType(v as ClientType)}
              options={CLIENT_TYPES.map((t) => ({ value: t, label: CLIENT_TYPE_LABELS[t] }))}
              hint={
                clientType === "monthly"
                  ? "Pays a recurring monthly fee (retainer). Add the monthly project to start billing."
                  : "Pays per project. Invoice them as work is delivered."
              }
            />
          </div>
          <TextField
            id="client-company"
            label="Company name"
            required
            className="sm:col-span-2"
            value={companyName}
            onChange={setCompanyName}
            placeholder="e.g. Migration Republic"
            error={errors.companyName}
            autoFocus
          />
          <TextField
            id="client-email"
            label="Contact email"
            type="email"
            required
            value={contactEmail}
            onChange={setContactEmail}
            placeholder="name@company.com"
            error={errors.contactEmail}
          />
          <TextField
            id="client-contact"
            label="Contact name"
            value={contactName}
            onChange={setContactName}
            placeholder="Who you deal with"
          />
          <TextField id="client-phone" label="Phone" type="tel" value={contactPhone} onChange={setContactPhone} />
          <TextField
            id="client-industry"
            label="Industry"
            value={industry}
            onChange={setIndustry}
            placeholder="e.g. Immigration services"
          />
          <TextField
            id="client-manager"
            label="Account manager"
            className="sm:col-span-2"
            value={accountManager}
            onChange={setAccountManager}
            placeholder="Who owns this relationship"
          />
        </div>

        {error && <Alert tone="error" className="mt-4">{error}</Alert>}
      </Modal>
    </>
  );
}

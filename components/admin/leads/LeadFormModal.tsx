"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  Alert,
  AdvancedSection,
  Modal,
  MoneyField,
  SelectField,
  TextField,
  TextareaField,
  btnGhost,
  btnPrimary,
} from "@/components/admin/ui";
import {
  LEAD_PRIORITIES,
  LEAD_PRIORITY_LABELS,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  type LeadPriority,
  type LeadStatus,
} from "@/lib/leads";
import { useOptions } from "@/lib/admin/use-options";
import { CURRENCIES, type Currency } from "@/lib/invoices";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Add a lead by hand - a call, a WhatsApp chat, a referral. Only a name plus
 * one way to reach them is required; everything else can be filled in later.
 * Lands in the same pipeline as website leads.
 */
export default function LeadFormModal() {
  const router = useRouter();
  const sources = useOptions("lead_sources");
  const services = useOptions("service_categories");
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [website, setWebsite] = useState("");
  const [sourceDetail, setSourceDetail] = useState("");
  const [category, setCategory] = useState("");
  const [service, setService] = useState("");
  const [status, setStatus] = useState<LeadStatus>("new");
  const [priority, setPriority] = useState<LeadPriority>("medium");
  const [value, setValue] = useState("");
  const [currency, setCurrency] = useState<Currency>("PKR");
  const [message, setMessage] = useState("");
  const [autoFollowUp, setAutoFollowUp] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setPhone("");
    setEmail("");
    setBusiness("");
    setWebsite("");
    setSourceDetail("");
    setCategory("");
    setService("");
    setStatus("new");
    setPriority("medium");
    setValue("");
    setCurrency("PKR");
    setMessage("");
    setAutoFollowUp(false);
    setErrors({});
    setError(null);
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const save = async () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "A name is required.";
    if (!email.trim() && !phone.trim()) next.contact = "Add a phone number or an email.";
    if (email.trim() && !EMAIL_RE.test(email.trim())) next.email = "That email doesn't look right.";
    if (value !== "" && (!Number.isFinite(Number(value)) || Number(value) < 0)) next.value = "Enter a valid amount.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          business: business.trim() || undefined,
          website: website.trim() || undefined,
          source_detail: sourceDetail || undefined,
          service_category: category || undefined,
          selected_service: service.trim() || undefined,
          status,
          priority,
          expected_value: value === "" ? undefined : Number(value),
          expected_value_currency: currency,
          message: message.trim() || undefined,
          auto_follow_up: autoFollowUp,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not add the lead.");

      const id = body.id;
      close();
      if (id) router.push(`/admin/leads/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add the lead.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={btnPrimary}>
        <Plus className="h-4 w-4" /> Add lead
      </button>

      <Modal
        open={open}
        onClose={close}
        title="Add lead"
        description="Log someone you've spoken to. A name and one way to reach them is enough."
        size="lg"
        footer={
          <>
            <button type="button" className={btnGhost} onClick={close}>
              Cancel
            </button>
            <button type="button" className={`${btnPrimary} ml-auto`} onClick={save} disabled={saving}>
              {saving ? "Adding…" : "Add lead"}
            </button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="lead-name" label="Name" required value={name} onChange={setName} error={errors.name} autoFocus />
          <TextField id="lead-business" label="Company" value={business} onChange={setBusiness} />
          <TextField
            id="lead-phone"
            label="Phone / WhatsApp"
            hint="Add a phone number or an email - at least one."
            type="tel"
            value={phone}
            onChange={setPhone}
            error={errors.contact}
          />
          <TextField id="lead-email" label="Email" type="email" value={email} onChange={setEmail} error={errors.email} />
          <SelectField
            id="lead-source"
            label="Where did they come from?"
            value={sourceDetail}
            onChange={setSourceDetail}
            options={sources.selectOptions}
            placeholder="Select…"
          />
          <SelectField
            id="lead-category"
            label="Service category"
            value={category}
            onChange={setCategory}
            options={services.selectOptions}
            placeholder="Select…"
          />
          <TextareaField
            id="lead-message"
            label="What do they need?"
            className="sm:col-span-2"
            value={message}
            onChange={setMessage}
            rows={3}
            placeholder="Notes from the conversation, budget, timeline…"
          />
          <AdvancedSection title="More details" hint="website, stage, priority, expected value, follow-up emails">
          <TextField id="lead-website" label="Website" value={website} onChange={setWebsite} placeholder="https://" />
          <TextField
            id="lead-service"
            label="Specific service"
            value={service}
            onChange={setService}
            placeholder="e.g. Website redesign"
          />
          <SelectField
            id="lead-status"
            label="Stage"
            value={status}
            onChange={(v) => setStatus(v as LeadStatus)}
            options={LEAD_STATUSES.filter((s) => s !== "lost").map((s) => ({ value: s, label: LEAD_STATUS_LABELS[s] }))}
          />
          <SelectField
            id="lead-priority"
            label="Priority"
            value={priority}
            onChange={(v) => setPriority(v as LeadPriority)}
            options={LEAD_PRIORITIES.map((p) => ({ value: p, label: LEAD_PRIORITY_LABELS[p] }))}
          />
          <MoneyField
            id="lead-value"
            label="Expected value"
            className="sm:col-span-2"
            amount={value}
            onAmountChange={setValue}
            currency={currency}
            onCurrencyChange={(v) => setCurrency(v as Currency)}
            currencies={CURRENCIES}
            error={errors.value}
          />
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#1A14A5]/15 px-4 py-3 sm:col-span-2">
            <input
              type="checkbox"
              checked={autoFollowUp}
              disabled={!email.trim()}
              onChange={(e) => setAutoFollowUp(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#1A14A5]"
            />
            <span className="text-sm">
              <span className="font-semibold text-[#231F20]">Send automatic follow-up emails</span>
              <span className="block text-xs text-[#231F20]/55">
                {email.trim()
                  ? "Day 1, 3 and 7 nurture emails, stopped once the lead moves past Contacted."
                  : "Needs an email address. Off by default - you've usually already spoken to them."}
              </span>
            </span>
          </label>
          </AdvancedSection>
        </div>

        {error && <Alert tone="error" className="mt-4">{error}</Alert>}
      </Modal>
    </>
  );
}

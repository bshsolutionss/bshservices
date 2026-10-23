"use client";

import { useEffect, useState } from "react";
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
import { LEAD_PRIORITIES, LEAD_PRIORITY_LABELS, type LeadPriority } from "@/lib/leads";
import { useOptions } from "@/lib/admin/use-options";
import { CURRENCIES, type Currency } from "@/lib/invoices";
import type { LeadStage } from "@/lib/lead-stages";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  stages: LeadStage[];
  employees: { id: string; name: string }[];
  /** Pre-selects a stage (the "+" on a board column). */
  defaultStatus?: string;
  /** Controlled mode: the board opens this from a column's "+" button. Omit for the self-contained "Add lead" button. */
  open?: boolean;
  onClose?: () => void;
  /** Label of the built-in trigger button. */
  label?: string;
}

/**
 * Add a lead by hand - a call, a WhatsApp chat, a referral. A name plus one
 * way to reach them is enough; everything else can be filled in later. Lands
 * in the same pipeline as website leads.
 */
export default function LeadFormModal({ stages, employees, defaultStatus, open: controlledOpen, onClose, label = "New lead" }: Props) {
  const router = useRouter();
  const sources = useOptions("lead_sources");
  const services = useOptions("service_categories");
  const [innerOpen, setInnerOpen] = useState(false);
  const controlled = controlledOpen !== undefined;
  const open = controlled ? controlledOpen : innerOpen;

  const openStages = stages.filter((s) => s.kind === "open");
  const firstStage = openStages[0]?.key ?? "new";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [sourceDetail, setSourceDetail] = useState("");
  const [category, setCategory] = useState("");
  const [service, setService] = useState("");
  const [status, setStatus] = useState(defaultStatus ?? firstStage);
  const [assignedTo, setAssignedTo] = useState("");
  const [followDate, setFollowDate] = useState("");
  const [followTime, setFollowTime] = useState("");
  const [priority, setPriority] = useState<LeadPriority>("medium");
  const [value, setValue] = useState("");
  const [currency, setCurrency] = useState<Currency>("PKR");
  const [message, setMessage] = useState("");

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Each time the dialog opens, start from the stage that was asked for.
  useEffect(() => {
    if (open) setStatus(defaultStatus ?? firstStage);
  }, [open, defaultStatus, firstStage]);

  const reset = () => {
    setName("");
    setPhone("");
    setEmail("");
    setBusiness("");
    setLocation("");
    setWebsite("");
    setSourceDetail("");
    setCategory("");
    setService("");
    setStatus(defaultStatus ?? firstStage);
    setAssignedTo("");
    setFollowDate("");
    setFollowTime("");
    setPriority("medium");
    setValue("");
    setCurrency("PKR");
    setMessage("");
    setErrors({});
    setError(null);
  };

  const close = () => {
    if (controlled) onClose?.();
    else setInnerOpen(false);
    reset();
  };

  const save = async () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "A name is required.";
    if (!email.trim() && !phone.trim()) next.contact = "Add a phone number or an email.";
    if (email.trim() && !EMAIL_RE.test(email.trim())) next.email = "That email doesn't look right.";
    if (value !== "" && (!Number.isFinite(Number(value)) || Number(value) < 0)) next.value = "Enter a valid amount.";
    if (followTime && !followDate) next.follow = "Pick a date for the follow-up.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // Local date + time -> an absolute moment, so the reminder fires at the time the person meant.
    const followUpAt = followDate ? new Date(`${followDate}T${followTime || "09:00"}`).toISOString() : undefined;

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
          location: location.trim() || undefined,
          website: website.trim() || undefined,
          source_detail: sourceDetail || undefined,
          service_category: category || undefined,
          selected_service: service.trim() || undefined,
          status,
          assigned_to: assignedTo || null,
          follow_up_at: followUpAt,
          priority,
          expected_value: value === "" ? undefined : Number(value),
          expected_value_currency: currency,
          message: message.trim() || undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not add the lead.");
      close();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add the lead.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {!controlled && (
        <button type="button" onClick={() => setInnerOpen(true)} className={btnPrimary}>
          <Plus className="h-4 w-4" /> {label}
        </button>
      )}

      <Modal
        open={open}
        onClose={close}
        title="New lead"
        description="Add a prospect to your pipeline. A name and one way to reach them is enough."
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
          <TextField id="lead-name" label="Contact name" required value={name} onChange={setName} error={errors.name} autoFocus className="sm:col-span-2" placeholder="e.g. Jane Doe" />
          <TextField id="lead-business" label="Company" value={business} onChange={setBusiness} placeholder="Company name" />
          <TextField id="lead-phone" label="Phone / WhatsApp" type="tel" value={phone} onChange={setPhone} error={errors.contact} hint="A phone or an email - at least one." />
          <TextField id="lead-email" label="Email" type="email" value={email} onChange={setEmail} error={errors.email} placeholder="email@example.com" />
          <TextField id="lead-location" label="Location" value={location} onChange={setLocation} placeholder="City, country" />
          <SelectField id="lead-source" label="Source" value={sourceDetail} onChange={setSourceDetail} options={sources.selectOptions} placeholder="Other" />
          <MoneyField
            id="lead-value"
            label="Estimated value"
            amount={value}
            onAmountChange={setValue}
            currency={currency}
            onCurrencyChange={(v) => setCurrency(v as Currency)}
            currencies={CURRENCIES}
            error={errors.value}
          />
          <SelectField id="lead-status" label="Stage" value={status} onChange={setStatus} options={openStages.map((s) => ({ value: s.key, label: s.label }))} hideOptional />
          <SelectField id="lead-assign" label="Assign to" value={assignedTo} onChange={setAssignedTo} options={employees.map((e) => ({ value: e.id, label: e.name }))} placeholder="Unassigned" />
          <div className="grid grid-cols-2 gap-3 sm:col-span-2">
            <TextField id="lead-follow-date" label="Follow-up date" type="date" value={followDate} onChange={setFollowDate} error={errors.follow} />
            <TextField id="lead-follow-time" label="Follow-up time" type="time" value={followTime} onChange={setFollowTime} hint="Defaults to 9:00 if you only pick a date." />
          </div>
          <TextareaField id="lead-message" label="Notes" className="sm:col-span-2" value={message} onChange={setMessage} rows={3} placeholder="Anything useful about this lead…" />
          <AdvancedSection title="More details" hint="website, service, priority">
            <TextField id="lead-website" label="Website" value={website} onChange={setWebsite} placeholder="https://" />
            <SelectField id="lead-category" label="Service category" value={category} onChange={setCategory} options={services.selectOptions} placeholder="Select…" />
            <TextField id="lead-service" label="Specific service" value={service} onChange={setService} placeholder="e.g. Website redesign" />
            <SelectField id="lead-priority" label="Priority" value={priority} onChange={(v) => setPriority(v as LeadPriority)} options={LEAD_PRIORITIES.map((p) => ({ value: p, label: LEAD_PRIORITY_LABELS[p] }))} hideOptional />
          </AdvancedSection>
        </div>

        {error && <Alert tone="error" className="mt-4">{error}</Alert>}
      </Modal>
    </>
  );
}

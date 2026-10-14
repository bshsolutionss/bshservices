"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import {
  Alert,
  Modal,
  SelectField,
  TextField,
  TextareaField,
  btnGhost,
  btnPrimary,
  btnSecondary,
} from "@/components/admin/ui";
import {
  PERSONAL_PROJECT_STATUSES,
  PERSONAL_PROJECT_STATUS_LABELS,
  type PersonalProject,
  type PersonalProjectStatus,
} from "@/lib/personal-projects";
import { CURRENCIES, CURRENCY_LABELS, type Currency } from "@/lib/invoices";

/** Add or edit one of your own projects (a product, a side business, an experiment). */
export default function PersonalProjectFormModal({
  project,
  defaultCurrency = "PKR",
}: {
  project?: PersonalProject;
  defaultCurrency?: Currency;
}) {
  const router = useRouter();
  const editing = !!project;

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [status, setStatus] = useState<PersonalProjectStatus>(project?.status ?? "idea");
  const [url, setUrl] = useState(project?.url ?? "");
  const [currency, setCurrency] = useState<Currency>(project?.currency ?? defaultCurrency);
  const [start, setStart] = useState(project?.start_date ?? "");
  const [target, setTarget] = useState(project?.target_date ?? "");
  const [notes, setNotes] = useState(project?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setError(null);
    if (!editing) {
      setName("");
      setDescription("");
      setUrl("");
      setStart("");
      setTarget("");
      setNotes("");
    }
  };

  const save = async () => {
    if (!name.trim()) return setError("Give the project a name.");
    if (start && target && target < start) return setError("Target date can't be before the start date.");
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(editing ? `/api/admin/personal-projects/${project!.id}` : "/api/admin/personal-projects", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          status,
          url: url.trim() || null,
          currency,
          start_date: start || null,
          target_date: target || null,
          notes: notes.trim() || null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not save.");
      close();
      if (!editing && body.id) router.push(`/admin/personal-projects/${body.id}`);
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
        {editing ? "Edit" : "New project"}
      </button>
      <Modal
        open={open}
        onClose={close}
        title={editing ? `Edit ${project!.name}` : "New personal project"}
        description="Your own products and ideas - kept separate from client work."
        size="lg"
        footer={
          <>
            <button type="button" className={btnGhost} onClick={close}>
              Cancel
            </button>
            <button type="button" className={`${btnPrimary} ml-auto`} onClick={save} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Create project"}
            </button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="pp-name" label="Name" required className="sm:col-span-2" value={name} onChange={setName} autoFocus />
          <TextareaField id="pp-desc" label="What is it?" className="sm:col-span-2" rows={2} value={description} onChange={setDescription} />
          <SelectField
            id="pp-status"
            label="Status"
            value={status}
            onChange={(v) => setStatus(v as PersonalProjectStatus)}
            options={PERSONAL_PROJECT_STATUSES.map((s) => ({ value: s, label: PERSONAL_PROJECT_STATUS_LABELS[s] }))}
          />
          <SelectField
            id="pp-currency"
            label="Currency"
            value={currency}
            onChange={(v) => setCurrency(v as Currency)}
            options={CURRENCIES.map((c) => ({ value: c, label: CURRENCY_LABELS[c] }))}
            hint="Costs and revenue are tracked in this currency."
          />
          <TextField id="pp-start" label="Started" type="date" value={start} onChange={setStart} />
          <TextField id="pp-target" label="Target launch" type="date" value={target} onChange={setTarget} />
          <TextField id="pp-url" label="Link" className="sm:col-span-2" value={url} onChange={setUrl} placeholder="https://" />
          <TextareaField id="pp-notes" label="Notes" className="sm:col-span-2" rows={2} value={notes} onChange={setNotes} />
        </div>
        {error && <Alert tone="error" className="mt-4">{error}</Alert>}
      </Modal>
    </>
  );
}

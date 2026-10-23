"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, ExternalLink, Plus, Share2, Trash2 } from "lucide-react";
import { Alert, ConfirmButton, Modal, SelectField, TextField, TextareaField, btnPrimary, btnSecondary } from "@/components/admin/ui";
import { PRESET_QUESTIONS, type FormQuestion, type LeadForm } from "@/lib/lead-forms";
import type { LeadStage } from "@/lib/lead-stages";
import { cn } from "@/lib/utils";

interface Props {
  stages: LeadStage[];
  siteUrl: string;
}

/** Share one link anywhere; everyone who fills it in lands on the board. */
export default function CollectFormModal({ stages, siteUrl }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [forms, setForms] = useState<LeadForm[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<LeadForm | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (selectId?: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/lead-forms", { cache: "no-store" });
      const json = await res.json();
      if (json.ok) {
        setForms(json.forms);
        setCounts(json.submissions);
        const pick = (json.forms as LeadForm[]).find((f) => f.id === (selectId ?? activeId)) ?? json.forms[0] ?? null;
        setActiveId(pick?.id ?? null);
        setDraft(pick ? { ...pick } : null);
      }
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per open
  }, [open]);

  const url = draft ? `${siteUrl}/f/${draft.slug}` : "";
  const edit = (patch: Partial<LeadForm>) => {
    setSaved(false);
    setDraft((d) => (d ? { ...d, ...patch } : d));
  };
  const setQuestion = (i: number, patch: Partial<FormQuestion>) => draft && edit({ questions: draft.questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)) });

  async function create() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/lead-forms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const json = await res.json().catch(() => null);
      if (!json?.ok) return setError(json?.error ?? "Could not create the form.");
      await load(json.form.id);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!draft) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/lead-forms/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          heading: draft.heading,
          intro: draft.intro ?? "",
          thank_you: draft.thank_you ?? "",
          questions: draft.questions,
          stage_key: draft.stage_key ?? "",
          active: draft.active,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!json?.ok) return setError(json?.error ?? "Could not save.");
      setSaved(true);
      await load(draft.id);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!draft) return;
    const res = await fetch(`/api/admin/lead-forms/${draft.id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Could not delete the form.");
    await load();
    router.refresh();
  }

  function addQuestion(label: string, type: FormQuestion["type"]) {
    if (!draft) return;
    edit({ questions: [...draft.questions, { id: `${type}-${Date.now().toString(36)}`, label, type, required: false }] });
  }

  const openStages = stages.filter((s) => s.kind === "open");

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={btnSecondary}>
        <Share2 className="h-4 w-4" /> Collect form
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Collect leads with a link"
        description="Share one link anywhere - Instagram bio, WhatsApp, ads, your email signature. Everyone who fills it in lands on your board."
        size="lg"
        footer={
          <button className={`${btnSecondary} ml-auto`} onClick={() => setOpen(false)}>
            Done
          </button>
        }
      >
        {loading && forms.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#231F20]/50">Loading...</p>
        ) : forms.length === 0 ? (
          <div className="py-8 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#F4F7FE] text-[#1A14A5]">
              <Share2 className="h-6 w-6" />
            </span>
            <h3 className="mt-3 font-bold">No form yet</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-[#231F20]/60">Create one and you&apos;ll get a link that asks for a name, phone, email and what they need. You can change the questions after.</p>
            {error && <Alert tone="error" className="mx-auto mt-3 max-w-sm text-left">{error}</Alert>}
            <button onClick={create} disabled={busy} className={`${btnPrimary} mt-4`}>
              <Plus className="h-4 w-4" /> {busy ? "Creating..." : "Create my form"}
            </button>
          </div>
        ) : (
          draft && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#231F20]/50">Your forms</span>
                {forms.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setActiveId(f.id);
                      setDraft({ ...f });
                      setSaved(false);
                    }}
                    className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold", f.id === activeId ? "bg-[#231F20] text-white" : "border border-[#1A14A5]/15 hover:bg-[#F4F7FE]")}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", f.active ? "bg-emerald-400" : "bg-amber-400")} />
                    {f.name} <span className="opacity-60">{counts[f.id] ?? 0}</span>
                  </button>
                ))}
                <button onClick={create} disabled={busy} className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#1A14A5]/30 px-3 py-1.5 text-sm font-semibold text-[#1A14A5]">
                  <Plus className="h-3.5 w-3.5" /> New
                </button>
              </div>

              <div className="rounded-xl bg-[#F4F7FE] p-3">
                <div className="flex items-center gap-2">
                  <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="min-w-0 flex-1 rounded-lg border border-[#1A14A5]/15 bg-white px-3 py-2 text-sm" aria-label="Form link" />
                  <button
                    onClick={() => navigator.clipboard.writeText(url).then(() => (setCopied(true), setTimeout(() => setCopied(false), 1500)))}
                    className={btnPrimary}
                  >
                    <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy"}
                  </button>
                  <a href={url} target="_blank" rel="noopener noreferrer" aria-label="Open form" className={btnSecondary}>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#231F20]/60">
                  <strong>{counts[draft.id] ?? 0}</strong> submissions
                  <button type="button" onClick={() => edit({ active: !draft.active })} className={cn("font-semibold hover:underline", draft.active ? "text-emerald-700" : "text-amber-700")}>
                    {draft.active ? "Live - pause it" : "Paused - make it live"}
                  </button>
                </p>
              </div>

              <TextField id="cf-name" label="Form name" value={draft.name} onChange={(v) => edit({ name: v })} hint="Only you see this." hideOptional />
              <TextField id="cf-heading" label="Heading" value={draft.heading} onChange={(v) => edit({ heading: v })} hideOptional />
              <TextareaField id="cf-intro" label="Intro" rows={2} value={draft.intro ?? ""} onChange={(v) => edit({ intro: v })} placeholder="Tell us a bit about your project and we'll get back to you within a day." />
              <TextareaField id="cf-thanks" label="Thank-you message" rows={2} value={draft.thank_you ?? ""} onChange={(v) => edit({ thank_you: v })} placeholder="Thanks - we've got your details and will be in touch shortly." />

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#231F20]/55">Questions</p>
                <div className="space-y-2">
                  {draft.questions.map((q, i) => (
                    <div key={q.id} className="flex items-center gap-3 rounded-xl border border-[#1A14A5]/10 p-2">
                      <input value={q.label} onChange={(e) => setQuestion(i, { label: e.target.value })} maxLength={120} aria-label="Question" className="min-w-0 flex-1 rounded-lg border border-[#1A14A5]/15 px-3 py-1.5 text-sm outline-none focus:border-[#1A14A5]/50" />
                      <label className="flex items-center gap-1.5 text-xs text-[#231F20]/60">
                        <input type="checkbox" checked={q.required} disabled={q.type === "name"} onChange={(e) => setQuestion(i, { required: e.target.checked })} className="h-3.5 w-3.5" />
                        Required
                      </label>
                      <button
                        type="button"
                        disabled={q.type === "name"}
                        onClick={() => edit({ questions: draft.questions.filter((_, idx) => idx !== i) })}
                        aria-label={`Remove ${q.label}`}
                        className="rounded-lg p-1.5 text-[#231F20]/40 hover:bg-red-50 hover:text-red-600 disabled:opacity-20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PRESET_QUESTIONS.filter((p) => !draft.questions.some((q) => q.type === p.type)).map((p) => (
                    <button key={p.type} type="button" onClick={() => addQuestion(p.label, p.type)} className="rounded-full bg-[#F4F7FE] px-3 py-1 text-xs font-semibold text-[#231F20]/70 hover:bg-[#E8E7FB]">
                      + {p.label}
                    </button>
                  ))}
                  <button type="button" onClick={() => addQuestion("Your question", "text")} className="rounded-full bg-[#E8E7FB] px-3 py-1 text-xs font-semibold text-[#1A14A5]">
                    + Your own question
                  </button>
                </div>
                <p className="mt-2 text-xs text-[#231F20]/50">Extra answers are saved on the lead, so nothing a visitor tells you gets lost.</p>
              </div>

              <SelectField
                id="cf-stage"
                label="Add new leads to"
                value={draft.stage_key ?? ""}
                onChange={(v) => edit({ stage_key: v || null })}
                options={[{ value: "", label: "First stage of the pipeline" }, ...openStages.map((s) => ({ value: s.key, label: s.label }))]}
                hideOptional
              />

              {error && <Alert tone="error">{error}</Alert>}
              <div className="flex items-center justify-between border-t border-[#1A14A5]/10 pt-4">
                <ConfirmButton display="inline" label="Delete form" icon={<Trash2 className="mr-1 inline h-3.5 w-3.5" />} title="Delete this form?" message="The link stops working. Leads it already collected stay on your board." onConfirm={remove} />
                <button onClick={save} disabled={busy || saved} className={btnPrimary}>
                  {busy ? "Saving..." : saved ? "Saved" : "Save changes"}
                </button>
              </div>
            </div>
          )
        )}
      </Modal>
    </>
  );
}

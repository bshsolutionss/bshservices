"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Alert, SectionCard, TextField, TextareaField, btnPrimary, btnSecondary } from "@/components/admin/ui";
import type { PortalWelcomeSettings } from "@/lib/portal/welcome";

export default function PortalSettingsForm({ initial }: { initial: PortalWelcomeSettings }) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const setItem = (i: number, patch: Partial<PortalWelcomeSettings["checklist"][number]>) =>
    setS({ ...s, checklist: s.checklist.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) });

  async function save() {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/settings/portal", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) });
    const json = await res.json().catch(() => null);
    setBusy(false);
    if (!json?.ok) return setMsg({ ok: false, text: json?.error ?? "Could not save." });
    setS(json.settings);
    setMsg({ ok: true, text: "Saved. New and returning clients see this in their Welcome walkthrough." });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Welcome walkthrough" subtitle="What clients read in the Welcome tab of their portal">
        <div className="space-y-4">
          <TextareaField id="pw-how" label="How we work together" rows={4} value={s.how_we_work} onChange={(v) => setS({ ...s, how_we_work: v })} />
          <TextareaField id="pw-next" label="What happens next" rows={5} value={s.what_happens_next} onChange={(v) => setS({ ...s, what_happens_next: v })} hint="One step per line." />
          <TextareaField id="pw-comm" label="How we communicate" rows={4} value={s.communication} onChange={(v) => setS({ ...s, communication: v })} />
        </div>
      </SectionCard>

      <SectionCard title="What we need from the client" subtitle="Checklist items they tick off during onboarding">
        <div className="space-y-3">
          {s.checklist.map((c, i) => (
            <div key={c.id + i} className="grid gap-3 rounded-xl border border-[#1A14A5]/10 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <TextField id={`pw-l-${i}`} label="Item" value={c.label} onChange={(v) => setItem(i, { label: v })} hideOptional />
              <TextField id={`pw-h-${i}`} label="Hint" value={c.hint ?? ""} onChange={(v) => setItem(i, { hint: v })} />
              <button
                type="button"
                onClick={() => setS({ ...s, checklist: s.checklist.filter((_, idx) => idx !== i) })}
                className="mb-1 rounded-lg p-2 text-red-600 hover:bg-red-50"
                aria-label="Remove item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button type="button" className={btnSecondary} onClick={() => setS({ ...s, checklist: [...s.checklist, { id: `item-${Date.now()}`, label: "" }] })}>
            <Plus className="h-4 w-4" /> Add item
          </button>
        </div>
      </SectionCard>

      {msg && <Alert tone={msg.ok ? "success" : "error"}>{msg.text}</Alert>}
      <button onClick={save} disabled={busy} className={btnPrimary}>
        {busy ? "Saving..." : "Save portal settings"}
      </button>
    </div>
  );
}

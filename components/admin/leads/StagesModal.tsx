"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import { Alert, Modal, btnPrimary, btnSecondary } from "@/components/admin/ui";
import { STAGE_PALETTE, type LeadStage, type LeadStageKind } from "@/lib/lead-stages";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<LeadStageKind, string> = { open: "Open", won: "Won", lost: "Lost" };

/** Add, rename, recolour, reorder or remove the pipeline's columns. */
export default function StagesModal({ stages }: { stages: LeadStage[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<LeadStage[]>(stages);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(STAGE_PALETTE[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function show() {
    setRows(stages);
    setError(null);
    setOpen(true);
  }

  const patch = (i: number, p: Partial<LeadStage>) => setRows(rows.map((r, idx) => (idx === i ? { ...r, ...p } : r)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    setRows(next);
  };

  function add() {
    const label = newName.trim();
    if (!label) return setError("Give the new stage a name.");
    setError(null);
    // New stages go before Won/Lost so the finish line stays at the end.
    const at = rows.findIndex((r) => r.kind !== "open");
    const stage: LeadStage = { key: "", label, color: newColor, position: 0, kind: "open" };
    setRows(at === -1 ? [...rows, stage] : [...rows.slice(0, at), stage, ...rows.slice(at)]);
    setNewName("");
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/lead-stages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stages: rows.map((r) => ({ key: r.key || undefined, label: r.label, color: r.color, kind: r.kind })) }),
      });
      const json = await res.json().catch(() => null);
      if (!json?.ok) return setError(json?.error ?? "Could not save the stages.");
      setOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" onClick={show} className={btnSecondary}>
        <SlidersHorizontal className="h-4 w-4" /> Stages
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Manage pipeline stages"
        description="Add, rename, recolour, reorder or remove columns."
        footer={
          <>
            <button className={btnSecondary} onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className={`${btnPrimary} ml-auto`} disabled={busy} onClick={save}>
              {busy ? "Saving..." : "Save stages"}
            </button>
          </>
        }
      >
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={`${r.key}-${i}`} className="flex items-center gap-2 rounded-xl border border-[#1A14A5]/10 p-2">
              <div className="flex flex-col">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="text-[#231F20]/40 hover:text-[#1A14A5] disabled:opacity-20">
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label="Move down" className="text-[#231F20]/40 hover:text-[#1A14A5] disabled:opacity-20">
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <label className="relative h-8 w-8 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-[#1A14A5]/15" title="Colour">
                <span className="absolute inset-1 rounded-full" style={{ background: r.color }} />
                <input type="color" value={r.color} onChange={(e) => patch(i, { color: e.target.value })} className="absolute inset-0 cursor-pointer opacity-0" />
              </label>
              <input
                value={r.label}
                onChange={(e) => patch(i, { label: e.target.value })}
                maxLength={40}
                aria-label="Stage name"
                className="min-w-0 flex-1 rounded-lg border border-[#1A14A5]/15 px-3 py-1.5 text-sm outline-none focus:border-[#1A14A5]/50"
              />
              <select
                value={r.kind}
                onChange={(e) => patch(i, { kind: e.target.value as LeadStageKind })}
                aria-label="What this stage means"
                title="Won turns a lead into a client + project. Lost asks for a reason."
                className={cn("rounded-lg border border-[#1A14A5]/15 bg-white px-2 py-1.5 text-xs font-semibold", r.kind === "won" && "text-emerald-700", r.kind === "lost" && "text-red-600")}
              >
                {(Object.keys(KIND_LABEL) as LeadStageKind[]).map((k) => (
                  <option key={k} value={k}>
                    {KIND_LABEL[k]}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => setRows(rows.filter((_, idx) => idx !== i))} aria-label={`Remove ${r.label}`} className="rounded-lg p-1.5 text-[#231F20]/40 hover:bg-red-50 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl bg-[#F4F7FE] p-3">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            <Plus className="h-4 w-4 text-[#1A14A5]" /> Add a new stage
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {STAGE_PALETTE.map((c) => (
              <button key={c} type="button" onClick={() => setNewColor(c)} aria-label={`Colour ${c}`} className={cn("h-6 w-6 rounded-full ring-offset-2", newColor === c && "ring-2 ring-[#231F20]/40")} style={{ background: c }} />
            ))}
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
              placeholder="Stage name (e.g. Negotiation)"
              maxLength={40}
              className="min-w-[10rem] flex-1 rounded-lg border border-[#1A14A5]/15 bg-white px-3 py-1.5 text-sm outline-none focus:border-[#1A14A5]/50"
            />
            <button type="button" onClick={add} className={btnPrimary}>
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-[#231F20]/50">
          Keep one Won stage (it creates the client and project) and one Lost stage. A stage can only be removed once no leads are in it.
        </p>
        {error && <Alert tone="error" className="mt-3">{error}</Alert>}
      </Modal>
    </>
  );
}

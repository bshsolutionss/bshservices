"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus } from "lucide-react";
import { Alert, Modal, SelectField, TextField, TextareaField, btnPrimary, btnSecondary } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const COLORS = ["#F97316", "#F43F5E", "#EC4899", "#A855F7", "#6366F1", "#3B82F6", "#06B6D4", "#14B8A6", "#10B981", "#84CC16", "#F59E0B", "#78716C"];

/** A shared board for internal work - hiring, marketing, ops - optionally around one client. */
export default function NewBoardModal({ clients }: { clients: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [clientId, setClientId] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setName("");
    setClientId("");
    setDescription("");
    setError(null);
  };

  async function create() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/task-boards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, color, clientId, description }) });
      const json = await res.json().catch(() => null);
      if (!json?.ok) return setError(json?.error ?? "Could not create the board.");
      close();
      router.push(`/admin/tasks?board=${json.id}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const preview = (name.trim() || "Board name").slice(0, 3).toUpperCase();

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={btnPrimary}>
        <Plus className="h-4 w-4" /> New board
      </button>
      <Modal
        open={open}
        onClose={close}
        title="New board"
        description="A shared board for internal work - hiring, marketing, ops."
        footer={
          <>
            <button className={btnSecondary} onClick={close}>
              Cancel
            </button>
            <button className={`${btnPrimary} ml-auto`} disabled={busy || !name.trim()} onClick={create}>
              {busy ? "Creating..." : "Create board"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <TextField id="board-name" label="Board name" value={name} onChange={setName} placeholder="e.g. Marketing, Hiring, Internal" hideOptional required autoFocus />
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#231F20]/55">Colour</p>
            <div className="flex flex-wrap items-center gap-2">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)} aria-label={`Colour ${c}`} className="grid h-8 w-8 place-items-center rounded-full text-white" style={{ background: c }}>
                  {color === c && <Check className="h-4 w-4" />}
                </button>
              ))}
              <label className="relative grid h-8 w-8 cursor-pointer place-items-center overflow-hidden rounded-full border border-dashed border-[#231F20]/30 text-xs" title="Custom colour">
                +
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
              </label>
              <span className="text-xs text-[#231F20]/50">{color}</span>
            </div>
          </div>
          <SelectField id="board-client" label="Who is this board for?" value={clientId} onChange={setClientId} options={clients.map((c) => ({ value: c.id, label: c.name }))} placeholder="Nobody - just our team" hint="Optional. Pick a client if the work is around one account." />
          <TextareaField id="board-desc" label="Description" rows={2} value={description} onChange={setDescription} placeholder="What is this board for?" />
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#231F20]/55">Preview</p>
            <div className={cn("flex items-center gap-3 rounded-xl border border-[#1A14A5]/10 bg-white p-3")} style={{ borderLeft: `4px solid ${color}` }}>
              <span className="grid h-10 w-10 place-items-center rounded-lg text-xs font-bold" style={{ background: `${color}22`, color }}>
                {preview}
              </span>
              <div>
                <p className="font-semibold">{name.trim() || "Board name"}</p>
                <p className="text-xs text-[#231F20]/50">Team board</p>
              </div>
            </div>
          </div>
          {error && <Alert tone="error">{error}</Alert>}
        </div>
      </Modal>
    </>
  );
}

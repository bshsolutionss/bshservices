"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { portalBtn, portalCard, portalInput, portalTextarea } from "@/components/portal/ui";

type Msg = { ok: boolean; text: string } | null;

function useSubmit() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  async function run(url: string, init: RequestInit, success: string): Promise<boolean> {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(url, init);
      const json = await res.json().catch(() => null);
      if (!json?.ok) {
        setMsg({ ok: false, text: json?.error ?? "That didn't work. Try again." });
        return false;
      }
      setMsg({ ok: true, text: json.internal ? "Saved as an internal note - an admin will publish it to the client." : success });
      router.refresh();
      return true;
    } finally {
      setBusy(false);
    }
  }
  return { busy, msg, run };
}

const note = (m: Msg) => m && <p className={cn("rounded-xl px-3 py-2 text-sm", m.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>{m.text}</p>;

/** Post a progress update on one project. */
export function ProgressForm({ projectId, internal }: { projectId: string; internal: boolean }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const { busy, msg, run } = useSubmit();
  return (
    <form
      className={`${portalCard} space-y-3 p-5`}
      onSubmit={async (e) => {
        e.preventDefault();
        if (await run("/api/team/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId, title, body }) }, "Update posted.")) {
          setTitle("");
          setBody("");
        }
      }}
    >
      <p className="font-semibold">Post an update</p>
      {internal && <p className="text-xs text-stone-500">Your updates are internal - they go to the team first and an admin decides what the client sees.</p>}
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Headline, e.g. Design phase done" className={portalInput} maxLength={200} required />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="What's happening now? (optional)" className={portalTextarea} maxLength={4000} />
      {note(msg)}
      <button disabled={busy} className={portalBtn}>
        {busy ? "Posting..." : "Post update"}
      </button>
    </form>
  );
}

/** Upload a file onto a project, optionally sharing it with the client. */
export function FileUploadForm({ projects, canShare, fixedProjectId }: { projects: { id: string; name: string }[]; canShare: boolean; fixedProjectId?: string }) {
  const [projectId, setProjectId] = useState(fixedProjectId ?? projects[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [share, setShare] = useState(false);
  const { busy, msg, run } = useSubmit();
  return (
    <form
      className={`${portalCard} space-y-3 p-5`}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!file) return;
        const form = new FormData();
        form.set("projectId", projectId);
        form.set("file", file);
        form.set("title", title);
        form.set("share", String(share));
        if (await run("/api/team/files", { method: "POST", body: form }, share ? "Uploaded and shared with the client." : "Uploaded.")) {
          setFile(null);
          setTitle("");
          (e.target as HTMLFormElement).reset();
        }
      }}
    >
      <p className="font-semibold">Upload a file</p>
      {!fixedProjectId && (
        <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={portalInput} aria-label="Project" required>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      )}
      <input type="file" required onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-orange-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white" />
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (defaults to the file name)" className={portalInput} maxLength={200} />
      {canShare && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} className="h-4 w-4 accent-orange-600" />
          Share with the client now (they&apos;ll be notified)
        </label>
      )}
      {note(msg)}
      <button disabled={busy || !file || !projectId} className={portalBtn}>
        {busy ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}

/** Schedule a meeting with a project's client. */
export function MeetingForm({ projects }: { projects: { id: string; name: string }[] }) {
  const [f, setF] = useState({ projectId: projects[0]?.id ?? "", title: "", startsAt: "", durationMinutes: "30", linkUrl: "" });
  const { busy, msg, run } = useSubmit();
  return (
    <form
      className={`${portalCard} space-y-3 p-5`}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!f.startsAt) return;
        if (await run("/api/team/meetings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, startsAt: new Date(f.startsAt).toISOString() }) }, "Meeting scheduled - the client was notified.")) {
          setF({ ...f, title: "", startsAt: "", linkUrl: "" });
        }
      }}
    >
      <p className="font-semibold">Schedule a meeting</p>
      <select value={f.projectId} onChange={(e) => setF({ ...f, projectId: e.target.value })} className={portalInput} aria-label="Project" required>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Title, e.g. Kick-off call" className={portalInput} maxLength={200} required />
      <div className="grid gap-3 sm:grid-cols-2">
        <input type="datetime-local" value={f.startsAt} onChange={(e) => setF({ ...f, startsAt: e.target.value })} className={portalInput} aria-label="Date and time" required />
        <input type="number" min="5" value={f.durationMinutes} onChange={(e) => setF({ ...f, durationMinutes: e.target.value })} className={portalInput} aria-label="Minutes" />
      </div>
      <input value={f.linkUrl} onChange={(e) => setF({ ...f, linkUrl: e.target.value })} placeholder="Meeting link (optional)" className={portalInput} />
      {note(msg)}
      <button disabled={busy || !f.projectId} className={portalBtn}>
        {busy ? "Scheduling..." : "Schedule"}
      </button>
    </form>
  );
}

/** Stage dropdown on a lead card (members with "update" access only). */
export function LeadStageSelect({ leadId, status, stages }: { leadId: string; status: string; stages: { key: string; label: string; kind: string }[] }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <select
        value={value}
        aria-label="Stage"
        onChange={async (e) => {
          const next = e.target.value;
          const previous = value;
          setValue(next);
          setError(null);
          const res = await fetch(`/api/team/leads/${leadId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
          const json = await res.json().catch(() => null);
          if (!json?.ok) {
            setValue(previous);
            setError(json?.error ?? "Could not move the lead.");
          } else router.refresh();
        }}
        className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium outline-none focus:border-orange-400"
      >
        {stages.map((s) => (
          <option key={s.key} value={s.key} disabled={s.kind !== "open" && s.key !== status}>
            {s.label}
            {s.kind !== "open" && s.key !== status ? " (admin only)" : ""}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 max-w-[16rem] text-xs text-red-600">{error}</p>}
    </div>
  );
}

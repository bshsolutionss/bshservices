"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Eye, EyeOff, Plus, Trash2, Video } from "lucide-react";
import {
  Alert,
  Badge,
  ConfirmButton,
  EmptyState,
  Modal,
  SectionCard,
  SelectField,
  TextField,
  TextareaField,
  btnPrimary,
  btnSecondary,
} from "@/components/admin/ui";
import { FileText } from "lucide-react";

/** One place for the fetch + error + refresh dance every card below repeats. */
function useCall() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function call(url: string, init: RequestInit): Promise<boolean> {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, init);
      const json = await res.json().catch(() => null);
      if (!json?.ok) {
        setError(json?.error ?? "That didn't work. Try again.");
        return false;
      }
      router.refresh();
      return true;
    } finally {
      setBusy(false);
    }
  }
  const json = (method: string, body: unknown): RequestInit => ({ method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { call, json, busy, error, setError };
}

interface ProjectLite {
  id: string;
  name: string;
}
const projectOptions = (projects: ProjectLite[]) => projects.map((p) => ({ value: p.id, label: p.name }));
const fmt = (iso: string) => new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

/* ── Approvals ───────────────────────────────────────────────────────── */

export interface ApprovalRow {
  id: string;
  title: string;
  status: string;
  client_comment: string | null;
  created_at: string;
}

const APPROVAL_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "#FEF3C7", text: "#92400E", label: "Waiting" },
  approved: { bg: "#D1FAE5", text: "#065F46", label: "Approved" },
  changes_requested: { bg: "#FEE2E2", text: "#991B1B", label: "Changes requested" },
};

export function ApprovalsCard({ clientId, projects, rows }: { clientId: string; projects: ProjectLite[]; rows: ApprovalRow[] }) {
  const { call, json, busy, error, setError } = useCall();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", description: "", linkUrl: "", projectId: "" });

  async function submit() {
    if (!f.title.trim()) return setError("Say what needs sign-off.");
    if (await call("/api/admin/portal/approvals", json("POST", { clientId, ...f }))) {
      setOpen(false);
      setF({ title: "", description: "", linkUrl: "", projectId: "" });
    }
  }

  return (
    <SectionCard
      title="Approvals"
      subtitle="Things the client signs off on in their portal"
      action={
        <button onClick={() => setOpen(true)} className={btnSecondary}>
          <Plus className="h-4 w-4" /> Request approval
        </button>
      }
    >
      {rows.length === 0 ? (
        <p className="text-sm text-[#231F20]/50">No approvals requested yet.</p>
      ) : (
        <ul className="divide-y divide-[#1A14A5]/5">
          {rows.map((a) => {
            const c = APPROVAL_COLORS[a.status] ?? APPROVAL_COLORS.pending;
            return (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-medium">{a.title}</p>
                  <p className="text-xs text-[#231F20]/50">
                    {fmt(a.created_at)}
                    {a.client_comment && ` · "${a.client_comment}"`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge label={c.label} colors={c} />
                  <ConfirmButton
                    display="inline"
                    label=""
                    icon={<Trash2 className="h-4 w-4" />}
                    title="Delete this approval?"
                    message="It disappears from the client's portal too."
                    onConfirm={async () => {
                      const res = await fetch(`/api/admin/portal/approvals/${a.id}`, { method: "DELETE" });
                      if (!res.ok) throw new Error("Could not delete.");
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Request approval"
        description="The client gets a notification and email, and can approve or ask for changes."
        footer={
          <>
            <button className={btnSecondary} onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className={`${btnPrimary} ml-auto`} disabled={busy} onClick={submit}>
              {busy ? "Sending..." : "Send for approval"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}
          <TextField id="ap-title" label="What needs sign-off?" value={f.title} onChange={(v) => setF({ ...f, title: v })} placeholder="e.g. Homepage design v2" required />
          <TextareaField id="ap-desc" label="Details" value={f.description} onChange={(v) => setF({ ...f, description: v })} />
          <TextField id="ap-link" label="Link to review" value={f.linkUrl} onChange={(v) => setF({ ...f, linkUrl: v })} placeholder="https://..." />
          {projects.length > 0 && <SelectField id="ap-project" label="Project" value={f.projectId} onChange={(v) => setF({ ...f, projectId: v })} options={projectOptions(projects)} placeholder="Not tied to a project" />}
        </div>
      </Modal>
    </SectionCard>
  );
}

/* ── Meetings ────────────────────────────────────────────────────────── */

export interface MeetingRow {
  id: string;
  title: string;
  starts_at: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  recording_url: string | null;
  link_url: string | null;
}

export function MeetingsCard({ clientId, projects, rows }: { clientId: string; projects: ProjectLite[]; rows: MeetingRow[] }) {
  const { call, json, busy, error, setError } = useCall();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MeetingRow | null>(null);
  const [f, setF] = useState({ title: "", startsAt: "", durationMinutes: "30", linkUrl: "", agenda: "", projectId: "" });
  const [notes, setNotes] = useState({ notes: "", recordingUrl: "" });

  async function submit() {
    if (!f.title.trim() || !f.startsAt) return setError("Add a title and a date/time.");
    const startsAt = new Date(f.startsAt).toISOString();
    if (await call("/api/admin/portal/meetings", json("POST", { clientId, ...f, startsAt }))) {
      setOpen(false);
      setF({ title: "", startsAt: "", durationMinutes: "30", linkUrl: "", agenda: "", projectId: "" });
    }
  }

  async function saveNotes() {
    if (!editing) return;
    if (await call(`/api/admin/portal/meetings/${editing.id}`, json("PATCH", { ...notes, status: "held" }))) setEditing(null);
  }

  return (
    <SectionCard
      title="Meetings"
      subtitle="Calls shown to the client with notes and recordings"
      action={
        <button onClick={() => setOpen(true)} className={btnSecondary}>
          <Plus className="h-4 w-4" /> Schedule
        </button>
      }
    >
      {rows.length === 0 ? (
        <p className="text-sm text-[#231F20]/50">No meetings yet.</p>
      ) : (
        <ul className="divide-y divide-[#1A14A5]/5">
          {rows.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-medium">
                  {m.title}
                  {m.link_url && (
                    <a href={m.link_url} target="_blank" rel="noopener noreferrer" aria-label="Join link" className="text-[#1A14A5]">
                      <Video className="h-3.5 w-3.5" />
                    </a>
                  )}
                </p>
                <p className="text-xs text-[#231F20]/50">
                  {fmt(m.starts_at)} · {m.duration_minutes} min
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  label={m.status === "scheduled" ? "Scheduled" : m.status === "held" ? "Held" : "Cancelled"}
                  colors={m.status === "scheduled" ? { bg: "#DBEAFE", text: "#1E40AF" } : m.status === "held" ? { bg: "#D1FAE5", text: "#065F46" } : { bg: "#FEE2E2", text: "#991B1B" }}
                />
                {m.status === "scheduled" && (
                  <button
                    className="text-xs font-semibold text-[#1A14A5] hover:underline"
                    onClick={() => {
                      setNotes({ notes: m.notes ?? "", recordingUrl: m.recording_url ?? "" });
                      setEditing(m);
                    }}
                  >
                    Mark held
                  </button>
                )}
                {m.status === "held" && (
                  <button
                    className="text-xs font-semibold text-[#1A14A5] hover:underline"
                    onClick={() => {
                      setNotes({ notes: m.notes ?? "", recordingUrl: m.recording_url ?? "" });
                      setEditing(m);
                    }}
                  >
                    Notes
                  </button>
                )}
                {m.status === "scheduled" && (
                  <button className="text-xs font-semibold text-[#231F20]/50 hover:underline" onClick={() => call(`/api/admin/portal/meetings/${m.id}`, json("PATCH", { status: "cancelled" }))}>
                    Cancel
                  </button>
                )}
                <ConfirmButton
                  display="inline"
                  label=""
                  icon={<Trash2 className="h-4 w-4" />}
                  title="Delete this meeting?"
                  message="It disappears from the client's portal too."
                  onConfirm={async () => {
                    const res = await fetch(`/api/admin/portal/meetings/${m.id}`, { method: "DELETE" });
                    if (!res.ok) throw new Error("Could not delete.");
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Schedule a meeting"
        description="The client is notified by email and in their portal."
        footer={
          <>
            <button className={btnSecondary} onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className={`${btnPrimary} ml-auto`} disabled={busy} onClick={submit}>
              {busy ? "Saving..." : "Schedule"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}
          <TextField id="mt-title" label="Title" value={f.title} onChange={(v) => setF({ ...f, title: v })} placeholder="e.g. Kick-off call" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField id="mt-start" label="Date & time" type="datetime-local" value={f.startsAt} onChange={(v) => setF({ ...f, startsAt: v })} required />
            <TextField id="mt-dur" label="Minutes" type="number" min="5" value={f.durationMinutes} onChange={(v) => setF({ ...f, durationMinutes: v })} hideOptional />
          </div>
          <TextField id="mt-link" label="Meeting link" value={f.linkUrl} onChange={(v) => setF({ ...f, linkUrl: v })} placeholder="https://meet.google.com/..." />
          <TextareaField id="mt-agenda" label="Agenda" value={f.agenda} onChange={(v) => setF({ ...f, agenda: v })} />
          {projects.length > 0 && <SelectField id="mt-project" label="Project" value={f.projectId} onChange={(v) => setF({ ...f, projectId: v })} options={projectOptions(projects)} placeholder="Not tied to a project" />}
        </div>
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `${editing.title} - notes` : "Notes"}
        description="Marks the meeting as held and shares these notes with the client."
        footer={
          <>
            <button className={btnSecondary} onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button className={`${btnPrimary} ml-auto`} disabled={busy} onClick={saveNotes}>
              {busy ? "Saving..." : "Save"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}
          <TextareaField id="mn-notes" label="Meeting notes" rows={6} value={notes.notes} onChange={(v) => setNotes({ ...notes, notes: v })} />
          <TextField id="mn-rec" label="Recording link" value={notes.recordingUrl} onChange={(v) => setNotes({ ...notes, recordingUrl: v })} placeholder="https://..." />
        </div>
      </Modal>
    </SectionCard>
  );
}

/* ── Documents ───────────────────────────────────────────────────────── */

export interface DocumentRow {
  id: string;
  title: string;
  category: string;
  file_name: string;
  shared: boolean;
  created_at: string;
}

const DOC_CATEGORIES = ["quotation", "contract", "deliverable", "invoice", "report", "other"].map((c) => ({ value: c, label: c[0].toUpperCase() + c.slice(1) }));

export function DocumentsCard({ clientId, projects, rows }: { clientId: string; projects: ProjectLite[]; rows: DocumentRow[] }) {
  const { call, json, busy, error, setError } = useCall();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [f, setF] = useState({ title: "", category: "other", projectId: "", shared: true });

  async function submit() {
    if (!file) return setError("Choose a file to upload.");
    const form = new FormData();
    form.set("clientId", clientId);
    form.set("file", file);
    form.set("title", f.title);
    form.set("category", f.category);
    form.set("projectId", f.projectId);
    form.set("shared", String(f.shared));
    if (await call("/api/admin/portal/documents", { method: "POST", body: form })) {
      setOpen(false);
      setFile(null);
      setF({ title: "", category: "other", projectId: "", shared: true });
    }
  }

  return (
    <SectionCard
      title="Documents"
      subtitle="Quotations, contracts and deliverables the client can download"
      action={
        <button onClick={() => setOpen(true)} className={btnSecondary}>
          <Plus className="h-4 w-4" /> Upload
        </button>
      }
    >
      {rows.length === 0 ? (
        <EmptyState icon={FileText} title="No documents yet" description="Upload a quotation, contract or finished work to share it." />
      ) : (
        <ul className="divide-y divide-[#1A14A5]/5">
          {rows.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{d.title}</p>
                <p className="truncate text-xs text-[#231F20]/50">
                  {d.file_name} · <span className="capitalize">{d.category}</span> · {fmt(d.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => call(`/api/admin/portal/documents/${d.id}`, json("PATCH", { shared: !d.shared }))}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#1A14A5] hover:underline"
                  title={d.shared ? "Visible to the client - click to hide" : "Hidden from the client - click to share"}
                >
                  {d.shared ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  {d.shared ? "Shared" : "Hidden"}
                </button>
                <a href={`/api/admin/portal/files/${d.id}`} aria-label={`Download ${d.file_name}`} className="text-[#1A14A5]">
                  <Download className="h-4 w-4" />
                </a>
                <ConfirmButton
                  display="inline"
                  label=""
                  icon={<Trash2 className="h-4 w-4" />}
                  title="Delete this document?"
                  message="The file is removed from storage and from the client's portal."
                  onConfirm={async () => {
                    const res = await fetch(`/api/admin/portal/documents/${d.id}`, { method: "DELETE" });
                    if (!res.ok) throw new Error("Could not delete.");
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Upload a document"
        footer={
          <>
            <button className={btnSecondary} onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className={`${btnPrimary} ml-auto`} disabled={busy} onClick={submit}>
              {busy ? "Uploading..." : "Upload"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}
          <div className="space-y-1.5">
            <label htmlFor="doc-file" className="block text-xs font-semibold uppercase tracking-wide text-[#231F20]/55">
              File <span className="text-red-500">*</span>
            </label>
            <input id="doc-file" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#1A14A5] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white" />
            <p className="text-xs text-[#231F20]/45">Up to 20 MB.</p>
          </div>
          <TextField id="doc-title" label="Title" value={f.title} onChange={(v) => setF({ ...f, title: v })} hint="Defaults to the file name." />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField id="doc-cat" label="Type" value={f.category} onChange={(v) => setF({ ...f, category: v })} options={DOC_CATEGORIES} />
            {projects.length > 0 && <SelectField id="doc-project" label="Project" value={f.projectId} onChange={(v) => setF({ ...f, projectId: v })} options={projectOptions(projects)} placeholder="Not tied to a project" />}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.shared} onChange={(e) => setF({ ...f, shared: e.target.checked })} className="h-4 w-4" />
            Share with the client now (they&apos;ll be notified)
          </label>
        </div>
      </Modal>
    </SectionCard>
  );
}

/* ── Progress updates ────────────────────────────────────────────────── */

export interface UpdateRow {
  id: string;
  title: string;
  created_at: string;
  project_name: string;
  /** Posted by a team member with internal-only access - hidden from the client until published. */
  internal: boolean;
  author_name: string | null;
}

export function UpdatesCard({ projects, rows }: { projects: ProjectLite[]; rows: UpdateRow[] }) {
  const { call, json, busy, error, setError } = useCall();
  const [f, setF] = useState({ projectId: projects[0]?.id ?? "", title: "", body: "" });
  if (projects.length === 0) return null;

  async function submit() {
    if (!f.title.trim()) return setError("Add a short headline.");
    if (await call("/api/admin/portal/updates", json("POST", f))) setF({ ...f, title: "", body: "" });
  }

  return (
    <SectionCard title="Progress updates" subtitle="Posted to the client's project timeline">
      <div className="space-y-3">
        {error && <Alert tone="error">{error}</Alert>}
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.length > 1 && <SelectField id="up-project" label="Project" value={f.projectId} onChange={(v) => setF({ ...f, projectId: v })} options={projectOptions(projects)} />}
          <TextField id="up-title" label="Headline" value={f.title} onChange={(v) => setF({ ...f, title: v })} placeholder="e.g. Design phase" />
        </div>
        <TextareaField id="up-body" label="What's happening now?" value={f.body} onChange={(v) => setF({ ...f, body: v })} />
        <button onClick={submit} disabled={busy} className={btnPrimary}>
          {busy ? "Posting..." : "Post update"}
        </button>
      </div>
      {rows.length > 0 && (
        <ul className="mt-5 divide-y divide-[#1A14A5]/5 border-t border-[#1A14A5]/10">
          {rows.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="flex items-center gap-2 truncate text-sm font-medium">
                  {u.title}
                  {u.internal && <Badge label="Internal" colors={{ bg: "#FEF3C7", text: "#92400E" }} />}
                </p>
                <p className="text-xs text-[#231F20]/50">
                  {u.project_name}
                  {u.author_name && ` · ${u.author_name}`} · {fmt(u.created_at)}
                </p>
              </div>
              {u.internal && (
                <button className="text-xs font-semibold text-[#1A14A5] hover:underline" onClick={() => call(`/api/admin/portal/updates/${u.id}`, json("PATCH", { internal: false }))}>
                  Publish to client
                </button>
              )}
              <ConfirmButton
                display="inline"
                label=""
                icon={<Trash2 className="h-4 w-4" />}
                title="Delete this update?"
                message="It's removed from the client's timeline."
                onConfirm={async () => {
                  const res = await fetch(`/api/admin/portal/updates/${u.id}`, { method: "DELETE" });
                  if (!res.ok) throw new Error("Could not delete.");
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

/* ── What the client can see ─────────────────────────────────────────── */

export interface VisibilityProject {
  id: string;
  name: string;
  portal_visible: boolean;
  tasks: { id: string; title: string; client_visible: boolean }[];
}

export function VisibilityCard({ projects }: { projects: VisibilityProject[] }) {
  const { call, json, error } = useCall();
  if (projects.length === 0) return null;

  const toggle = (kind: "project" | "task", id: string, visible: boolean) => call("/api/admin/portal/visibility", json("POST", { kind, id, visible }));

  return (
    <SectionCard title="What the client can see" subtitle="Projects are visible by default. Tasks stay internal until you share them.">
      {error && <Alert tone="error" className="mb-3">{error}</Alert>}
      <div className="space-y-4">
        {projects.map((p) => (
          <div key={p.id}>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={p.portal_visible} onChange={(e) => toggle("project", p.id, e.target.checked)} className="h-4 w-4" />
              {p.name}
            </label>
            {p.tasks.length > 0 && (
              <ul className="mt-2 space-y-1 border-l-2 border-[#1A14A5]/10 pl-4">
                {p.tasks.map((t) => (
                  <li key={t.id}>
                    <label className="flex items-center gap-2 text-sm text-[#231F20]/70">
                      <input type="checkbox" checked={t.client_visible} onChange={(e) => toggle("task", t.id, e.target.checked)} className="h-3.5 w-3.5" />
                      {t.title}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, MessageSquarePlus, Send } from "lucide-react";
import {
  Alert,
  ChoiceField,
  Modal,
  SelectField,
  TextField,
  TextareaField,
  btnGhost,
  btnPrimary,
  btnSecondary,
} from "@/components/admin/ui";
import {
  COMM_CHANNELS,
  COMM_CHANNEL_LABELS,
  fillTemplate,
  whatsAppLinkFor,
  type CommChannel,
  type CommClientOption,
  type CommDirection,
  type MessageTemplate,
} from "@/lib/communications";

interface SharedProps {
  clients: CommClientOption[];
  projects: { id: string; name: string; client_id: string }[];
  /** Pre-selects (and locks the picker to) one client - used on a client's own page. */
  fixedClientId?: string;
  variant?: "solid" | "outline";
}

function nowLocalInput(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function useClientPicker({ clients, projects, fixedClientId }: SharedProps) {
  const [clientId, setClientId] = useState(fixedClientId ?? "");
  const [projectId, setProjectId] = useState("");
  const client = clients.find((c) => c.id === clientId);
  const clientProjects = useMemo(() => projects.filter((p) => p.client_id === clientId), [projects, clientId]);
  return { clientId, setClientId, projectId, setProjectId, client, clientProjects };
}

/* ───────────────────────── Log a call / chat / meeting / note ───────────────────────── */

export function LogCommunicationModal(props: SharedProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const picker = useClientPicker(props);
  const [channel, setChannel] = useState<CommChannel>("call");
  const [direction, setDirection] = useState<CommDirection>("outbound");
  const [subject, setSubject] = useState("");
  const [summary, setSummary] = useState("");
  const [when, setWhen] = useState(nowLocalInput);
  const [followUp, setFollowUp] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setError(null);
    setSubject("");
    setSummary("");
    setFollowUp("");
    setWhen(nowLocalInput());
    if (!props.fixedClientId) picker.setClientId("");
    picker.setProjectId("");
  };

  const save = async () => {
    if (!picker.clientId) return setError("Choose a client.");
    if (!subject.trim() && !summary.trim()) return setError("Add a subject or a few notes about what was discussed.");
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: picker.clientId,
          project_id: picker.projectId || null,
          channel,
          direction: channel === "note" ? "outbound" : direction,
          subject,
          summary,
          occurred_at: new Date(when).toISOString(),
          follow_up_on: followUp || null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not save.");
      close();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const whatsapp = channel === "whatsapp" ? whatsAppLinkFor(picker.client?.contact_phone) : null;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={props.variant === "outline" ? btnSecondary : btnPrimary}>
        <MessageSquarePlus className="h-4 w-4" /> Log communication
      </button>
      <Modal
        open={open}
        onClose={close}
        title="Log communication"
        description="Keep a record of every call, chat and meeting so nothing about a client lives only in your head."
        size="lg"
        footer={
          <>
            <button type="button" className={btnGhost} onClick={close}>
              Cancel
            </button>
            <button type="button" className={`${btnPrimary} ml-auto`} onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {!props.fixedClientId && (
            <SelectField
              id="comm-client"
              label="Client"
              required
              value={picker.clientId}
              onChange={(v) => {
                picker.setClientId(v);
                picker.setProjectId("");
              }}
              options={props.clients.map((c) => ({ value: c.id, label: c.company_name }))}
              placeholder="Select a client…"
            />
          )}
          <SelectField
            id="comm-project"
            label="Project (optional)"
            value={picker.projectId}
            onChange={picker.setProjectId}
            options={picker.clientProjects.map((p) => ({ value: p.id, label: p.name }))}
            placeholder={picker.clientId ? "General" : "Pick a client first"}
            disabled={!picker.clientId}
          />
          <div className="sm:col-span-2">
            <ChoiceField
              label="How"
              value={channel}
              onChange={(v) => setChannel(v as CommChannel)}
              options={COMM_CHANNELS.filter((c) => c !== "email").map((c) => ({ value: c, label: COMM_CHANNEL_LABELS[c] }))}
            />
          </div>
          {channel !== "note" && (
            <ChoiceField
              label="Who started it"
              value={direction}
              onChange={(v) => setDirection(v as CommDirection)}
              options={[
                { value: "outbound", label: "I contacted them" },
                { value: "inbound", label: "They contacted me" },
              ]}
            />
          )}
          <TextField id="comm-when" label="When" type="datetime-local" value={when} onChange={setWhen} />
          <TextField id="comm-subject" label="Subject" className="sm:col-span-2" value={subject} onChange={setSubject} placeholder="e.g. Homepage feedback call" />
          <TextareaField id="comm-summary" label="What was discussed" className="sm:col-span-2" rows={4} value={summary} onChange={setSummary} />
          <TextField
            id="comm-followup"
            label="Follow up on"
            type="date"
            value={followUp}
            onChange={setFollowUp}
            hint="Shows under Follow-ups due on that day."
          />
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 self-end pb-2 text-sm font-medium text-emerald-700 hover:underline"
            >
              Open WhatsApp chat <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
        {error && <Alert tone="error" className="mt-4">{error}</Alert>}
      </Modal>
    </>
  );
}

/* ───────────────────────── Email a client ───────────────────────── */

export function ComposeEmailModal(props: SharedProps & { templates: MessageTemplate[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const picker = useClientPicker(props);
  const [to, setTo] = useState(() => props.clients.find((c) => c.id === props.fixedClientId)?.contact_email ?? "");
  const [templateId, setTemplateId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const projectName = picker.clientProjects.find((p) => p.id === picker.projectId)?.name;
  const values = {
    name: (picker.client?.contact_name || picker.client?.company_name || "").split(" ")[0],
    company: picker.client?.company_name,
    project: projectName,
  };

  const applyTemplate = (id: string, nextValues = values) => {
    setTemplateId(id);
    const template = props.templates.find((t) => t.id === id);
    if (!template) return;
    setSubject(fillTemplate(template.subject ?? "", nextValues));
    setMessage(fillTemplate(template.body, nextValues));
  };

  const close = () => {
    setOpen(false);
    setError(null);
    setDone(null);
    setTemplateId("");
    setSubject("");
    setMessage("");
    setFollowUp("");
    picker.setProjectId("");
    if (!props.fixedClientId) {
      picker.setClientId("");
      setTo("");
    }
  };

  const send = async () => {
    if (!picker.clientId) return setError("Choose a client.");
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/communications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: picker.clientId,
          project_id: picker.projectId || null,
          to,
          subject,
          message,
          follow_up_on: followUp || null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not send the email.");
      setDone(`Sent to ${body.sent_to}${body.logged ? " and saved to the client's history" : ""}.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={props.variant === "outline" ? btnSecondary : btnPrimary}>
        <Send className="h-4 w-4" /> Email a client
      </button>
      <Modal
        open={open}
        onClose={close}
        title="Email a client"
        description="Sent from the address connected under Settings > Email, and saved to their history."
        size="lg"
        footer={
          done ? (
            <button type="button" className={`${btnPrimary} ml-auto`} onClick={close}>
              Done
            </button>
          ) : (
            <>
              <button type="button" className={btnGhost} onClick={close}>
                Cancel
              </button>
              <button type="button" className={`${btnPrimary} ml-auto`} onClick={send} disabled={sending}>
                <Send className="h-4 w-4" />
                {sending ? "Sending…" : "Send email"}
              </button>
            </>
          )
        }
      >
        {done ? (
          <Alert tone="success">{done}</Alert>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {!props.fixedClientId && (
              <SelectField
                id="mail-client"
                label="Client"
                required
                value={picker.clientId}
                onChange={(v) => {
                  picker.setClientId(v);
                  picker.setProjectId("");
                  const c = props.clients.find((x) => x.id === v);
                  setTo(c?.contact_email ?? "");
                  if (templateId) {
                    applyTemplate(templateId, {
                      name: (c?.contact_name || c?.company_name || "").split(" ")[0],
                      company: c?.company_name,
                      project: undefined,
                    });
                  }
                }}
                options={props.clients.map((c) => ({ value: c.id, label: c.company_name }))}
                placeholder="Select a client…"
              />
            )}
            <SelectField
              id="mail-project"
              label="Project (optional)"
              value={picker.projectId}
              onChange={picker.setProjectId}
              options={picker.clientProjects.map((p) => ({ value: p.id, label: p.name }))}
              placeholder={picker.clientId ? "General" : "Pick a client first"}
              disabled={!picker.clientId}
            />
            <TextField id="mail-to" label="To" type="email" required value={to} onChange={setTo} />
            <SelectField
              id="mail-template"
              label="Start from a template"
              value={templateId}
              onChange={(v) => applyTemplate(v)}
              options={props.templates.map((t) => ({ value: t.id, label: t.name }))}
              placeholder="Blank message"
              hint="Edit templates under Settings > Message templates."
            />
            <TextField id="mail-subject" label="Subject" required className="sm:col-span-2" value={subject} onChange={setSubject} />
            <TextareaField id="mail-message" label="Message" required className="sm:col-span-2" rows={7} value={message} onChange={setMessage} />
            <TextField id="mail-followup" label="Follow up on" type="date" value={followUp} onChange={setFollowUp} hint="Optional reminder if they do not reply." />
            {error && <Alert tone="error" className="sm:col-span-2">{error}</Alert>}
          </div>
        )}
      </Modal>
    </>
  );
}

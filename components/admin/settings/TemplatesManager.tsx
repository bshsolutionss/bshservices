"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  Alert,
  ConfirmButton,
  EmptyState,
  Modal,
  SectionCard,
  TextField,
  TextareaField,
  btnGhost,
  btnPrimary,
} from "@/components/admin/ui";
import type { MessageTemplate } from "@/lib/communications";

function TemplateModal({ template, onClose }: { template: MessageTemplate | null; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(template?.name ?? "");
  const [subject, setSubject] = useState(template?.subject ?? "");
  const [body, setBody] = useState(template?.body ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(template ? `/api/admin/message-templates/${template.id}` : "/api/admin/message-templates", {
        method: template ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, subject, body }),
      });
      const parsed = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(parsed.error || "Could not save.");
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={template ? "Edit template" : "New template"}
      description="Use {{name}}, {{company}} and {{project}} - they are filled in with the client's details when you use the template."
      size="lg"
      footer={
        <>
          <button type="button" className={btnGhost} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={`${btnPrimary} ml-auto`} onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save template"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <TextField id="tpl-name" label="Template name" required value={name} onChange={setName} autoFocus />
        <TextField id="tpl-subject" label="Email subject" value={subject} onChange={setSubject} />
        <TextareaField id="tpl-body" label="Message" required rows={8} value={body} onChange={setBody} />
        {error && <Alert tone="error">{error}</Alert>}
      </div>
    </Modal>
  );
}

/** Reusable client messages (project update, payment reminder…) - edited here, picked when emailing a client. */
export default function TemplatesManager({ templates }: { templates: MessageTemplate[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<MessageTemplate | "new" | null>(null);

  return (
    <>
      <SectionCard
        title="Message templates"
        subtitle="Pick one when emailing a client to start from a ready-made message"
        action={
          <button type="button" onClick={() => setEditing("new")} className={btnPrimary}>
            <Plus className="h-4 w-4" /> New template
          </button>
        }
      >
        {templates.length === 0 ? (
          <EmptyState title="No templates yet" description="Create your first reusable message." />
        ) : (
          <ul className="divide-y divide-[#1A14A5]/5">
            {templates.map((t) => (
              <li key={t.id} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-semibold text-[#231F20]">{t.name}</p>
                  {t.subject && <p className="text-xs text-[#231F20]/50">Subject: {t.subject}</p>}
                  <p className="mt-1 line-clamp-2 whitespace-pre-line text-sm text-[#231F20]/65">{t.body}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <button type="button" onClick={() => setEditing(t)} className="text-[#1A14A5]" aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <ConfirmButton
                    label=""
                    display="inline"
                    icon={<Trash2 className="h-4 w-4" />}
                    title={`Delete "${t.name}"?`}
                    confirmLabel="Delete"
                    message="Emails already sent are not affected."
                    onConfirm={async () => {
                      const res = await fetch(`/api/admin/message-templates/${t.id}`, { method: "DELETE" });
                      const body = await res.json().catch(() => ({}));
                      if (!res.ok) throw new Error(body.error || "Could not delete.");
                      router.refresh();
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
      {editing && <TemplateModal template={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
    </>
  );
}

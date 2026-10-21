"use client";

import { useState } from "react";
import { CheckCircle2, Mail, Send, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Alert,
  ChoiceField,
  SectionCard,
  TextField,
  btnPrimary,
  btnSecondary,
} from "@/components/admin/ui";

export interface EmailSettingsView {
  provider: "env" | "smtp" | "resend";
  from_name: string;
  from_email: string;
  reply_to: string;
  admin_email: string;
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  smtp_user: string;
  has_smtp_pass: boolean;
  has_resend_key: boolean;
  notify_task_assigned: boolean;
  notify_invoice_sent: boolean;
  notify_task_updated: boolean;
  connected: boolean;
  transport: string;
}

const SMTP_PRESETS = [
  { label: "Gmail", host: "smtp.gmail.com", port: 465, secure: true },
  { label: "Outlook / Microsoft 365", host: "smtp.office365.com", port: 587, secure: false },
  { label: "Zoho", host: "smtp.zoho.com", port: 465, secure: true },
  { label: "Hostinger", host: "smtp.hostinger.com", port: 465, secure: true },
];

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#1A14A5]/10 p-3 transition hover:bg-[#F4F7FE]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-[#1A14A5]"
      />
      <span>
        <span className="block text-sm font-semibold text-[#231F20]">{label}</span>
        <span className="block text-xs text-[#231F20]/55">{hint}</span>
      </span>
    </label>
  );
}

/** Connect and test the mailbox the admin panel sends from (task assignments, invoices). */
export default function EmailSettingsForm({ initial }: { initial: EmailSettingsView }) {
  const [s, setS] = useState(initial);
  const [smtpPass, setSmtpPass] = useState("");
  const [resendKey, setResendKey] = useState("");
  const [testTo, setTestTo] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const patch = <K extends keyof EmailSettingsView>(key: K, value: EmailSettingsView[K]) =>
    setS((current) => ({ ...current, [key]: value }));

  const save = async (): Promise<boolean> => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: s.provider,
          from_name: s.from_name,
          from_email: s.from_email,
          reply_to: s.reply_to,
          admin_email: s.admin_email,
          smtp_host: s.smtp_host,
          smtp_port: s.smtp_port,
          smtp_secure: s.smtp_secure,
          smtp_user: s.smtp_user,
          smtp_pass: smtpPass || undefined,
          resend_key: resendKey || undefined,
          notify_task_assigned: s.notify_task_assigned,
          notify_invoice_sent: s.notify_invoice_sent,
          notify_task_updated: s.notify_task_updated,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not save.");
      setS(body.settings);
      setSmtpPass("");
      setResendKey("");
      setMessage({ tone: "success", text: "Saved." });
      return true;
    } catch (err) {
      setMessage({ tone: "error", text: err instanceof Error ? err.message : "Could not save." });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    // Test what's on screen, not what was saved last time.
    if (!(await save())) return;
    setTesting(true);
    try {
      const res = await fetch("/api/admin/settings/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testTo || undefined }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "The test email failed.");
      setMessage({ tone: "success", text: `Test email sent to ${body.sent_to}. Check that inbox.` });
    } catch (err) {
      setMessage({ tone: "error", text: err instanceof Error ? err.message : "The test email failed." });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border px-4 py-3",
          s.connected ? "border-emerald-100 bg-emerald-50" : "border-amber-100 bg-amber-50"
        )}
      >
        {s.connected ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        ) : (
          <XCircle className="h-5 w-5 text-amber-600" />
        )}
        <p className="text-sm font-semibold text-[#231F20]">
          {s.connected
            ? `Connected via ${s.transport === "smtp" ? "SMTP" : "Resend"}, emails are ready to send.`
            : "Not connected, pick a provider below. Task assignment emails won't send until you do."}
        </p>
      </div>

      <SectionCard title="Connection" subtitle="Where outgoing mail is sent from">
        <div className="space-y-5">
          <ChoiceField
            label="Provider"
            value={s.provider}
            onChange={(v) => patch("provider", v as EmailSettingsView["provider"])}
            options={[
              { value: "smtp", label: "Gmail / SMTP" },
              { value: "resend", label: "Resend" },
              { value: "env", label: "Server default" },
            ]}
          />

          {s.provider === "smtp" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {SMTP_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      patch("smtp_host", preset.host);
                      patch("smtp_port", preset.port);
                      patch("smtp_secure", preset.secure);
                    }}
                    className="rounded-lg bg-[#F4F7FE] px-2.5 py-1 text-xs font-semibold text-[#231F20]/60 transition hover:bg-[#1A14A5]/10 hover:text-[#1A14A5]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField id="smtp-host" label="SMTP host" value={s.smtp_host} onChange={(v) => patch("smtp_host", v)} />
                <TextField
                  id="smtp-port"
                  label="Port"
                  type="number"
                  value={String(s.smtp_port)}
                  onChange={(v) => patch("smtp_port", Number(v) || 0)}
                  hint="465 (SSL) or 587 (STARTTLS)."
                />
                <TextField
                  id="smtp-user"
                  label="Email / username"
                  value={s.smtp_user}
                  onChange={(v) => patch("smtp_user", v)}
                  placeholder="you@gmail.com"
                />
                <TextField
                  id="smtp-pass"
                  label="Password / app password"
                  value={smtpPass}
                  onChange={setSmtpPass}
                  placeholder={s.has_smtp_pass ? "•••••••• saved, type to replace" : "Paste app password"}
                  hint="Gmail needs an App Password (Google Account → Security → 2-Step Verification → App passwords), not your normal password. Stored encrypted."
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-[#231F20]/70">
                <input
                  type="checkbox"
                  checked={s.smtp_secure}
                  onChange={(e) => patch("smtp_secure", e.target.checked)}
                  className="h-4 w-4 accent-[#1A14A5]"
                />
                Use SSL (turn off for port 587)
              </label>
            </div>
          )}

          {s.provider === "resend" && (
            <TextField
              id="resend-key"
              label="Resend API key"
              value={resendKey}
              onChange={setResendKey}
              placeholder={s.has_resend_key ? "•••••••• saved, type to replace" : "re_..."}
              hint="Your sending domain must be verified in Resend. Stored encrypted."
            />
          )}

          {s.provider === "env" && (
            <Alert tone="info">
              Uses the <strong>RESEND_API_KEY</strong> configured on the server, the same setup the website forms use.
            </Alert>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Sender" subtitle="How your emails appear to the recipient">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="from-name" label="From name" value={s.from_name} onChange={(v) => patch("from_name", v)} />
          <TextField
            id="from-email"
            label="From email"
            type="email"
            value={s.from_email}
            onChange={(v) => patch("from_email", v)}
            hint="Leave empty to use the SMTP username. Must be allowed by your provider."
          />
          <TextField
            id="reply-to"
            label="Reply-to"
            type="email"
            value={s.reply_to}
            onChange={(v) => patch("reply_to", v)}
            hint="Where replies go. Optional."
          />
          <TextField
            id="admin-email"
            label="Your notification email"
            type="email"
            value={s.admin_email}
            onChange={(v) => patch("admin_email", v)}
            hint="Internal alerts are sent here."
          />
        </div>
      </SectionCard>

      <SectionCard title="Automatic emails" subtitle="What gets emailed without you doing anything">
        <div className="grid gap-3 sm:grid-cols-2">
          <Toggle
            checked={s.notify_task_assigned}
            onChange={(v) => patch("notify_task_assigned", v)}
            label="Task assigned"
            hint="Email the team member the moment a task is assigned to them."
          />
          <Toggle
            checked={s.notify_task_updated}
            onChange={(v) => patch("notify_task_updated", v)}
            label="Task reassigned or rescheduled"
            hint="Email when the assignee changes or the due date moves."
          />
          <Toggle
            checked={s.notify_invoice_sent}
            onChange={(v) => patch("notify_invoice_sent", v)}
            label="Mark invoice as sent when emailed"
            hint="A draft invoice becomes Sent as soon as you email it to the client."
          />
        </div>
      </SectionCard>

      <SectionCard title="Send a test" subtitle="Saves the settings above, then sends a message through them">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1">
            <TextField
              id="test-to"
              label="Send test to"
              type="email"
              value={testTo}
              onChange={setTestTo}
              placeholder="Defaults to your login email"
            />
          </div>
          <button type="button" onClick={sendTest} disabled={testing || saving} className={btnSecondary}>
            <Send className="h-4 w-4" />
            {testing ? "Sending…" : "Save & send test"}
          </button>
        </div>
      </SectionCard>

      {message && <Alert tone={message.tone}>{message.text}</Alert>}

      <div className="flex justify-end">
        <button type="button" onClick={save} disabled={saving || testing} className={btnPrimary}>
          <Mail className="h-4 w-4" />
          {saving ? "Saving…" : "Save settings"}
        </button>
      </div>
    </div>
  );
}

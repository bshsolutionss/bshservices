import nodemailer from "nodemailer";
import { Resend } from "resend";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { resolveEmailConfig } from "@/lib/email/settings";

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer }[];
  /** Short machine label shown in the email log, e.g. "task_assigned". */
  kind: string;
  entityType?: string;
  entityId?: string;
}

export type SendEmailResult = { ok: true } | { ok: false; error: string };

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>|<\/p>|<\/tr>|<\/h\d>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function log(input: SendEmailInput, status: "sent" | "failed", error?: string) {
  try {
    const supabase = createServiceRoleClient();
    const recipients = Array.isArray(input.to) ? input.to : [input.to];
    await supabase.from("email_log").insert(
      recipients.map((to) => ({
        to_email: to,
        subject: input.subject.slice(0, 300),
        kind: input.kind,
        status,
        error: error?.slice(0, 500) ?? null,
        entity_type: input.entityType ?? null,
        entity_id: input.entityId ?? null,
      }))
    );
  } catch {
    // Logging is best-effort (table may not exist before the migration).
  }
}

/**
 * The one way the admin panel sends mail. Uses whatever is connected under
 * Settings → Email (SMTP such as Gmail, or Resend), falling back to the
 * RESEND_API_KEY env var the site already used. Never throws — returns a
 * result so callers (task assignment, invoices) can surface a warning without
 * failing the save that triggered the email.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  try {
    const config = await resolveEmailConfig();
    const replyTo = input.replyTo ?? config.replyTo;
    const text = input.text ?? stripHtml(input.html);

    if (config.transport === "smtp" && config.smtp) {
      const transport = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: { user: config.smtp.user, pass: config.smtp.pass },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 20_000,
      });
      await transport.sendMail({
        from: config.fromHeader,
        to: input.to,
        replyTo,
        subject: input.subject,
        html: input.html,
        text,
        attachments: input.attachments,
      });
    } else if (config.transport === "resend" && config.resendKey) {
      const { error } = await new Resend(config.resendKey).emails.send({
        from: config.fromHeader,
        to: input.to,
        replyTo,
        subject: input.subject,
        html: input.html,
        text,
        attachments: input.attachments?.map((a) => ({ filename: a.filename, content: a.content })),
      });
      if (error) throw new Error(error.message);
    } else {
      throw new Error("Email isn't connected yet. Connect it under Settings → Email.");
    }

    await log(input, "sent");
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not send the email.";
    console.error(`[email:${input.kind}] failed:`, message);
    await log(input, "failed", message);
    return { ok: false, error: message };
  }
}

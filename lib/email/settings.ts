import { createServiceRoleClient } from "@/lib/supabase/service";
import { decryptSecret } from "@/lib/secret-box";

export type EmailProvider = "env" | "smtp" | "resend";

/** What's persisted in app_settings (key "email"). Secrets are stored encrypted. */
export interface StoredEmailSettings {
  provider: EmailProvider;
  from_name: string;
  from_email: string;
  reply_to: string;
  /** Where internal notifications (new lead, payment received…) go. */
  admin_email: string;
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  smtp_user: string;
  smtp_pass_enc: string;
  resend_key_enc: string;
  notify_task_assigned: boolean;
  notify_invoice_sent: boolean;
  /** Also email the assignee when a task's due date or priority changes. */
  notify_task_updated: boolean;
}

export const DEFAULT_EMAIL_SETTINGS: StoredEmailSettings = {
  provider: "env",
  from_name: "BSH Solutions",
  from_email: "",
  reply_to: "",
  admin_email: "",
  smtp_host: "smtp.gmail.com",
  smtp_port: 465,
  smtp_secure: true,
  smtp_user: "",
  smtp_pass_enc: "",
  resend_key_enc: "",
  notify_task_assigned: true,
  notify_invoice_sent: true,
  notify_task_updated: true,
};

export const EMAIL_SETTINGS_KEY = "email";

export async function getStoredEmailSettings(): Promise<StoredEmailSettings> {
  try {
    const supabase = createServiceRoleClient();
    const { data } = await supabase.from("app_settings").select("value").eq("key", EMAIL_SETTINGS_KEY).maybeSingle();
    return { ...DEFAULT_EMAIL_SETTINGS, ...((data?.value as Partial<StoredEmailSettings>) ?? {}) };
  } catch {
    // app_settings missing (migration not run yet) → behave like before: env-based Resend.
    return { ...DEFAULT_EMAIL_SETTINGS };
  }
}

export interface ResolvedEmailConfig {
  transport: "smtp" | "resend" | "none";
  fromHeader: string;
  fromEmail: string;
  replyTo: string | undefined;
  adminEmail: string;
  settings: StoredEmailSettings;
  smtp?: { host: string; port: number; secure: boolean; user: string; pass: string };
  resendKey?: string;
}

/** Merges stored settings with the env-var defaults the site already used. */
export async function resolveEmailConfig(): Promise<ResolvedEmailConfig> {
  const settings = await getStoredEmailSettings();
  const envKey = process.env.RESEND_API_KEY || process.env.RESEND_API || "";
  const envFrom = process.env.EMAIL_FROM || "BSH Solutions <info@bshsolutions.net>";
  const adminEmail = settings.admin_email || process.env.ADMIN_EMAIL || "info@bshsolutions.net";

  const fromEmailOf = (header: string) => header.match(/<([^>]+)>/)?.[1] ?? header;
  const header = (email: string) => (settings.from_name ? `${settings.from_name} <${email}>` : email);

  if (settings.provider === "smtp") {
    const pass = decryptSecret(settings.smtp_pass_enc);
    if (settings.smtp_host && settings.smtp_user && pass) {
      const fromEmail = settings.from_email || settings.smtp_user;
      return {
        transport: "smtp",
        fromHeader: header(fromEmail),
        fromEmail,
        replyTo: settings.reply_to || undefined,
        adminEmail,
        settings,
        smtp: {
          host: settings.smtp_host,
          port: Number(settings.smtp_port) || 465,
          secure: !!settings.smtp_secure,
          user: settings.smtp_user,
          pass,
        },
      };
    }
  }

  const resendKey = (settings.provider === "resend" ? decryptSecret(settings.resend_key_enc) : null) || envKey;
  const fromEmail = settings.from_email || fromEmailOf(envFrom);
  return {
    transport: resendKey ? "resend" : "none",
    fromHeader: settings.from_email ? header(settings.from_email) : envFrom,
    fromEmail,
    replyTo: settings.reply_to || undefined,
    adminEmail,
    settings,
    resendKey: resendKey || undefined,
  };
}

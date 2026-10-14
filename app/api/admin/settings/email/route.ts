import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { encryptSecret } from "@/lib/secret-box";
import { sendEmail } from "@/lib/email/send";
import { testEmail } from "@/lib/email/templates";
import {
  EMAIL_SETTINGS_KEY,
  getStoredEmailSettings,
  resolveEmailConfig,
  type EmailProvider,
  type StoredEmailSettings,
} from "@/lib/email/settings";

const PROVIDERS: EmailProvider[] = ["env", "smtp", "resend"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** What the browser is allowed to see — never the secrets themselves, only whether they're set. */
function publicView(settings: StoredEmailSettings, connected: boolean, transport: string) {
  const { smtp_pass_enc, resend_key_enc, ...rest } = settings;
  return { ...rest, has_smtp_pass: !!smtp_pass_enc, has_resend_key: !!resend_key_enc, connected, transport };
}

export async function GET() {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const config = await resolveEmailConfig();
  return NextResponse.json({
    ok: true,
    settings: publicView(config.settings, config.transport !== "none", config.transport),
    effective_from: config.fromHeader,
    effective_admin_email: config.adminEmail,
  });
}

interface SavePayload extends Partial<Omit<StoredEmailSettings, "smtp_pass_enc" | "resend_key_enc">> {
  /** Plain-text secrets: only sent when the admin typed a new one. Empty/undefined keeps the stored value. */
  smtp_pass?: string;
  resend_key?: string;
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  let payload: SavePayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const current = await getStoredEmailSettings();
  const next: StoredEmailSettings = { ...current };

  if (payload.provider !== undefined) {
    if (!PROVIDERS.includes(payload.provider)) {
      return NextResponse.json({ ok: false, error: "Invalid provider." }, { status: 400 });
    }
    next.provider = payload.provider;
  }

  for (const field of ["from_name", "from_email", "reply_to", "admin_email", "smtp_host", "smtp_user"] as const) {
    if (payload[field] !== undefined) next[field] = String(payload[field]).trim().slice(0, 200);
  }
  for (const field of ["from_email", "reply_to", "admin_email"] as const) {
    if (next[field] && !EMAIL_RE.test(next[field])) {
      return NextResponse.json({ ok: false, error: `"${next[field]}" isn't a valid email address.` }, { status: 400 });
    }
  }

  if (payload.smtp_port !== undefined) {
    const port = Number(payload.smtp_port);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      return NextResponse.json({ ok: false, error: "SMTP port must be between 1 and 65535." }, { status: 400 });
    }
    next.smtp_port = port;
  }
  if (payload.smtp_secure !== undefined) next.smtp_secure = !!payload.smtp_secure;
  for (const field of ["notify_task_assigned", "notify_invoice_sent", "notify_task_updated"] as const) {
    if (payload[field] !== undefined) next[field] = !!payload[field];
  }

  try {
    if (payload.smtp_pass?.trim()) next.smtp_pass_enc = encryptSecret(payload.smtp_pass.replace(/\s+/g, ""));
    if (payload.resend_key?.trim()) next.resend_key_enc = encryptSecret(payload.resend_key.trim());
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not store credentials." },
      { status: 500 }
    );
  }

  if (next.provider === "smtp" && (!next.smtp_host || !next.smtp_user || !next.smtp_pass_enc)) {
    return NextResponse.json(
      { ok: false, error: "SMTP needs a host, a username and a password (for Gmail, use an App Password)." },
      { status: 400 }
    );
  }
  if (next.provider === "resend" && !next.resend_key_enc) {
    return NextResponse.json({ ok: false, error: "Paste your Resend API key to use Resend." }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("app_settings")
    .upsert({ key: EMAIL_SETTINGS_KEY, value: next, updated_at: new Date().toISOString() });
  if (error) {
    console.error("[api/admin/settings/email] save failed:", error);
    return NextResponse.json(
      { ok: false, error: "Could not save. Run supabase/migrations/0012_business_management.sql first." },
      { status: 500 }
    );
  }

  const config = await resolveEmailConfig();
  return NextResponse.json({ ok: true, settings: publicView(config.settings, config.transport !== "none", config.transport) });
}

/** Sends a test message to the given address (default: the signed-in admin) using the saved connection. */
export async function POST(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const body = (await request.json().catch(() => ({}))) as { to?: string };
  const to = (body.to || auth.user.email || "").trim();
  if (!EMAIL_RE.test(to)) {
    return NextResponse.json({ ok: false, error: "Enter an address to send the test to." }, { status: 400 });
  }

  const template = testEmail();
  const result = await sendEmail({ to, ...template, kind: "test" });
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
  return NextResponse.json({ ok: true, sent_to: to });
}

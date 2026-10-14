import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email/send";
import { clientMessageEmail } from "@/lib/email/templates";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Emails a client from the panel and logs it on their communication history. */
export async function POST(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const payload = (await request.json().catch(() => null)) as {
    client_id?: string;
    project_id?: string | null;
    to?: string;
    subject?: string;
    message?: string;
    follow_up_on?: string | null;
  } | null;
  if (!payload?.client_id) return NextResponse.json({ ok: false, error: "Choose a client." }, { status: 400 });

  const to = payload.to?.trim() ?? "";
  const subject = payload.subject?.trim() ?? "";
  const message = payload.message?.trim() ?? "";
  if (!EMAIL_RE.test(to)) return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  if (!subject) return NextResponse.json({ ok: false, error: "Add a subject." }, { status: 400 });
  if (!message) return NextResponse.json({ ok: false, error: "Write a message." }, { status: 400 });
  if (payload.follow_up_on && !/^\d{4}-\d{2}-\d{2}$/.test(payload.follow_up_on)) {
    return NextResponse.json({ ok: false, error: "Invalid follow-up date." }, { status: 400 });
  }

  const template = clientMessageEmail({ subject, message });
  const result = await sendEmail({
    to,
    subject,
    html: template.html,
    text: message,
    kind: "client_message",
    entityType: "client",
    entityId: payload.client_id,
  });
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 502 });

  // The email is already out; failing to log it must not look like a failed send.
  const service = createServiceRoleClient();
  const { error } = await service.from("communications").insert({
    client_id: payload.client_id,
    project_id: payload.project_id || null,
    channel: "email",
    direction: "outbound",
    subject: subject.slice(0, 200),
    summary: message.slice(0, 5000),
    follow_up_on: payload.follow_up_on || null,
  });
  if (error) console.error("[api/admin/communications/send] log failed:", error);

  return NextResponse.json({ ok: true, sent_to: to, logged: !error });
}

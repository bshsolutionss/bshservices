import { NextResponse, type NextRequest } from "next/server";
import { after } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { loadThread, readMessageForm, sendMessage } from "@/lib/portal/chat";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { notifyClient } from "@/lib/portal/session";
import { sendEmail } from "@/lib/email/send";
import { getCompanySettings } from "@/lib/admin/company-settings";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { id } = await params;
  return NextResponse.json({ ok: true, messages: await loadThread(id, "admin") });
}

const EMAIL_GAP_MS = 15 * 60_000;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { id } = await params;

  const service = createServiceRoleClient();
  const { data: conversation } = await service.from("conversations").select("id, client_id").eq("id", id).maybeSingle();
  if (!conversation) return NextResponse.json({ ok: false, error: "Conversation not found." }, { status: 404 });

  const form = await readMessageForm(request);
  if (!form) return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });

  const company = await getCompanySettings();
  // Whether to email depends on the previous team message, so look before inserting this one.
  const { data: prev } = await service
    .from("messages")
    .select("created_at")
    .eq("conversation_id", id)
    .eq("sender_type", "admin")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const emailDue = !prev || Date.now() - new Date(prev.created_at).getTime() > EMAIL_GAP_MS;

  const result = await sendMessage({ conversationId: id, side: "admin", senderName: company.name, body: form.body, file: form.file });
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: result.status });

  const text = form.body.trim().slice(0, 140) || "Sent you an attachment";
  after(async () => {
    await notifyClient(conversation.client_id, `New message from ${company.name}`, text, "/portal/messages");
    if (!emailDue) return;
    const { data: users } = await service.from("client_users").select("email").eq("client_id", conversation.client_id).eq("active", true);
    const to = (users ?? []).map((u) => u.email as string);
    if (to.length === 0) return;
    const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    await sendEmail({
      to,
      subject: `New message from ${company.name}`,
      kind: "portal_message",
      entityType: "client",
      entityId: conversation.client_id,
      html: `<p>You have a new message from ${company.name}:</p><blockquote style="border-left:3px solid #ea580c;margin:12px 0;padding:4px 12px;color:#444">${escaped}</blockquote><p><a href="${SITE_URL}/portal/messages">Open your portal to reply</a></p>`,
    });
  });
  return NextResponse.json({ ok: true });
}

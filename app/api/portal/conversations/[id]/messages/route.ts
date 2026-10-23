import { NextResponse, type NextRequest } from "next/server";
import { requirePortalUser } from "@/lib/portal/session";
import { loadThread, readMessageForm, sendMessage } from "@/lib/portal/chat";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { sendAdminPush } from "@/lib/push";

export const dynamic = "force-dynamic";

/** True only when the conversation belongs to the signed-in client. */
async function ownsConversation(id: string, clientId: string): Promise<boolean> {
  const { data } = await createServiceRoleClient().from("conversations").select("id").eq("id", id).eq("client_id", clientId).maybeSingle();
  return !!data;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePortalUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { id } = await params;
  if (!(await ownsConversation(id, auth.session.clientId))) {
    return NextResponse.json({ ok: false, error: "Conversation not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, messages: await loadThread(id, "client") });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePortalUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { session } = auth;
  const { id } = await params;
  if (!(await ownsConversation(id, session.clientId))) {
    return NextResponse.json({ ok: false, error: "Conversation not found." }, { status: 404 });
  }

  const form = await readMessageForm(request);
  if (!form) return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });

  const result = await sendMessage({ conversationId: id, side: "client", senderName: session.name, body: form.body, file: form.file });
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: result.status });

  await sendAdminPush({
    title: `New message from ${session.clientName}`,
    body: form.body.trim().slice(0, 100) || "Sent an attachment",
    url: "/admin/messages",
  }).catch(() => {});
  return NextResponse.json({ ok: true });
}

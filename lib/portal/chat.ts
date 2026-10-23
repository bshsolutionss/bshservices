import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

/**
 * Chat logic shared by the portal (/api/portal/*) and the admin inbox
 * (/api/admin/messages/*). The routes differ only in WHO may touch WHICH
 * conversation; everything else lives here so both sides behave the same.
 */

export type ChatSide = "client" | "admin";

export interface ConversationSummary {
  id: string;
  title: string;
  client_id: string;
  client_name: string;
  project_id: string | null;
  last_message_at: string;
  last_preview: string | null;
  last_sender: ChatSide | null;
  unread: number;
}

export interface ChatMessage {
  id: string;
  created_at: string;
  sender_type: ChatSide;
  sender_name: string | null;
  body: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  read_at: string | null;
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

// Allowlist, not a blocklist: SVG/HTML could run script if someone opened the file directly.
const ALLOWED_TYPES = [
  /^image\/(png|jpe?g|gif|webp)$/,
  /^audio\//,
  /^video\/(mp4|webm|quicktime)$/,
  /^application\/pdf$/,
  /^application\/(zip|x-zip-compressed)$/,
  /^application\/(msword|vnd\.ms-excel|vnd\.ms-powerpoint)$/,
  /^application\/vnd\.openxmlformats-officedocument\./,
  /^text\/(plain|csv)$/,
];

export function isAllowedUpload(file: File): string | null {
  if (file.size === 0) return "That file is empty.";
  if (file.size > MAX_UPLOAD_BYTES) return "Files can be up to 10 MB.";
  const type = file.type.split(";")[0].trim().toLowerCase();
  if (!ALLOWED_TYPES.some((re) => re.test(type))) return "That file type isn't supported. Try an image, PDF, document or voice note.";
  return null;
}

/** Storage keys can't carry arbitrary characters; keep the original name only for display. */
function safeKey(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-80) || "file";
}

function preview(m: { body: string | null; attachment_name: string | null; attachment_type?: string | null }): string {
  if (m.body) return m.body.slice(0, 120);
  if (m.attachment_type?.startsWith("audio/")) return "Voice note";
  if (m.attachment_type?.startsWith("image/")) return "Photo";
  return m.attachment_name ? `File: ${m.attachment_name}` : "";
}

/** Finds the client's main chat, creating it on first use. */
export async function ensureMainConversation(clientId: string, title: string): Promise<string> {
  const service = createServiceRoleClient();
  const { data: existing } = await service
    .from("conversations")
    .select("id")
    .eq("client_id", clientId)
    .is("project_id", null)
    .order("created_at")
    .limit(1)
    .maybeSingle();
  if (existing) return existing.id;
  const { data, error } = await service.from("conversations").insert({ client_id: clientId, title }).select("id").single();
  if (error || !data) throw new Error("Could not start the conversation.");
  return data.id;
}

/** Conversations for one client (portal) or all clients (admin), newest first, with unread counts for `side`. */
export async function listConversations(side: ChatSide, clientId?: string): Promise<ConversationSummary[]> {
  const service = createServiceRoleClient();
  let query = service.from("conversations").select("id, title, client_id, project_id, last_message_at, clients(company_name)").order("last_message_at", { ascending: false }).limit(100);
  if (clientId) query = query.eq("client_id", clientId);
  const { data: convs } = await query;
  const rows = convs ?? [];
  if (rows.length === 0) return [];

  const ids = rows.map((c) => c.id as string);
  const { data: msgs } = await service
    .from("messages")
    .select("conversation_id, sender_type, body, attachment_name, attachment_type, read_at, created_at")
    .in("conversation_id", ids)
    .order("created_at", { ascending: false })
    .limit(1000);

  const last = new Map<string, { sender_type: ChatSide; text: string }>();
  const unread = new Map<string, number>();
  for (const m of msgs ?? []) {
    if (!last.has(m.conversation_id)) last.set(m.conversation_id, { sender_type: m.sender_type, text: preview(m) });
    if (m.sender_type !== side && !m.read_at) unread.set(m.conversation_id, (unread.get(m.conversation_id) ?? 0) + 1);
  }

  return rows.map((c) => {
    const client = (Array.isArray(c.clients) ? c.clients[0] : c.clients) as { company_name: string } | null;
    const l = last.get(c.id);
    return {
      id: c.id,
      title: c.title,
      client_id: c.client_id,
      client_name: client?.company_name ?? "Client",
      project_id: c.project_id,
      last_message_at: c.last_message_at,
      last_preview: l?.text ?? null,
      last_sender: l?.sender_type ?? null,
      unread: unread.get(c.id) ?? 0,
    };
  });
}

/** The thread, oldest first. Opening it marks the other side's messages as read. */
export async function loadThread(conversationId: string, side: ChatSide): Promise<ChatMessage[]> {
  const service = createServiceRoleClient();
  const { data } = await service
    .from("messages")
    .select("id, created_at, sender_type, sender_name, body, attachment_name, attachment_type, read_at")
    .eq("conversation_id", conversationId)
    .order("created_at")
    .limit(500);
  const messages = (data ?? []) as ChatMessage[];

  if (messages.some((m) => m.sender_type !== side && !m.read_at)) {
    const now = new Date().toISOString();
    await service.from("messages").update({ read_at: now }).eq("conversation_id", conversationId).neq("sender_type", side).is("read_at", null);
    for (const m of messages) if (m.sender_type !== side && !m.read_at) m.read_at = now;
  }
  return messages;
}

export interface SendInput {
  conversationId: string;
  side: ChatSide;
  senderName: string;
  body: string;
  file: File | null;
}

/** Stores the optional attachment and the message. Returns an error string for the caller to show. */
export async function sendMessage(input: SendInput): Promise<{ ok: true; id: string } | { ok: false; error: string; status: number }> {
  const body = input.body.trim().slice(0, 5000);
  if (!body && !input.file) return { ok: false, error: "Write a message or attach a file.", status: 400 };

  const service = createServiceRoleClient();
  let attachment: { path: string; name: string; type: string } | null = null;
  if (input.file) {
    const problem = isAllowedUpload(input.file);
    if (problem) return { ok: false, error: problem, status: 400 };
    const type = input.file.type.split(";")[0].trim().toLowerCase();
    const path = `chat/${input.conversationId}/${randomUUID()}-${safeKey(input.file.name)}`;
    const { error: uploadError } = await service.storage.from("portal-files").upload(path, Buffer.from(await input.file.arrayBuffer()), { contentType: type });
    if (uploadError) {
      console.error("[chat] upload failed:", uploadError);
      return { ok: false, error: "Could not upload the file. Try again.", status: 500 };
    }
    attachment = { path, name: input.file.name.slice(0, 200), type };
  }

  const { data, error } = await service
    .from("messages")
    .insert({
      conversation_id: input.conversationId,
      sender_type: input.side,
      sender_name: input.senderName.slice(0, 120),
      body: body || null,
      attachment_path: attachment?.path ?? null,
      attachment_name: attachment?.name ?? null,
      attachment_type: attachment?.type ?? null,
    })
    .select("id")
    .single();
  if (error || !data) {
    console.error("[chat] insert failed:", error);
    return { ok: false, error: "Could not send. Try again.", status: 500 };
  }
  await service.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", input.conversationId);
  return { ok: true, id: data.id };
}

/** Reads the multipart body the composer posts: { body, file? }. */
export async function readMessageForm(request: Request): Promise<{ body: string; file: File | null } | null> {
  try {
    const form = await request.formData();
    const file = form.get("file");
    return { body: String(form.get("body") ?? ""), file: file instanceof File && file.size > 0 ? file : null };
  } catch {
    return null;
  }
}

/** Redirects to a signed link for a message attachment (the caller has already checked access). */
export async function attachmentRedirect(messageId: string, allowedClientId?: string): Promise<NextResponse> {
  const service = createServiceRoleClient();
  const { data: msg } = await service
    .from("messages")
    .select("attachment_path, attachment_name, attachment_type, conversations(client_id)")
    .eq("id", messageId)
    .maybeSingle();
  const conv = msg ? ((Array.isArray(msg.conversations) ? msg.conversations[0] : msg.conversations) as { client_id: string } | null) : null;
  if (!msg?.attachment_path || (allowedClientId && conv?.client_id !== allowedClientId)) {
    return NextResponse.json({ ok: false, error: "File not found." }, { status: 404 });
  }
  const inline = msg.attachment_type?.startsWith("image/") || msg.attachment_type?.startsWith("audio/");
  const { data, error } = await service.storage
    .from("portal-files")
    .createSignedUrl(msg.attachment_path, 60, inline ? undefined : { download: msg.attachment_name ?? true });
  if (error || !data) return NextResponse.json({ ok: false, error: "Could not open the file." }, { status: 500 });
  return NextResponse.redirect(data.signedUrl);
}

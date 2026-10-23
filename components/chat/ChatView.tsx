"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, FileText, Mic, Paperclip, Plus, Search, Send, Square, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage, ChatSide, ConversationSummary } from "@/lib/portal/chat";

interface Props {
  side: ChatSide;
  /** "/api/portal" for clients, "/api/admin/messages" for the team. */
  apiBase: string;
  /** Where attachments are served from, e.g. "/api/portal/messages". Append "/<id>/attachment". */
  attachmentBase: string;
  /** Admin only: clients the team can start a new chat with. */
  clients?: { id: string; name: string }[];
  initialConversationId?: string;
  /** Height of the whole chat area; the pages differ in how much chrome sits above it. */
  className?: string;
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86_400_000);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
const clock = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
const initials = (name: string) => name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export default function ChatView({ side, apiBase, attachmentBase, clients, initialConversationId, className }: Props) {
  const convUrl = `${apiBase}/conversations`;
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(initialConversationId ?? null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const lastCount = useRef(0);

  const loadList = useCallback(async () => {
    try {
      const res = await fetch(convUrl, { cache: "no-store" });
      const json = await res.json();
      if (json.ok) {
        setConversations(json.conversations);
        setActiveId((cur) => cur ?? (side === "client" ? (json.conversations[0]?.id ?? null) : null));
      }
    } catch {
      // Offline - retry on the next tick.
    } finally {
      setLoaded(true);
    }
  }, [convUrl, side]);

  const loadThread = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`${apiBase}/conversations/${id}/messages`, { cache: "no-store" });
        const json = await res.json();
        if (json.ok) setMessages(json.messages);
      } catch {
        // Keep the current thread.
      }
    },
    [apiBase]
  );

  useEffect(() => {
    loadList();
    const t = setInterval(() => document.visibilityState === "visible" && loadList(), 8000);
    return () => clearInterval(t);
  }, [loadList]);

  useEffect(() => {
    if (!activeId) return;
    setMessages([]);
    lastCount.current = 0;
    loadThread(activeId);
    const t = setInterval(() => document.visibilityState === "visible" && loadThread(activeId), 4000);
    return () => clearInterval(t);
  }, [activeId, loadThread]);

  useEffect(() => {
    if (messages.length !== lastCount.current) {
      lastCount.current = messages.length;
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((c) => {
      if (filter === "unread" && c.unread === 0) return false;
      if (!q) return true;
      return `${c.title} ${c.client_name} ${c.last_preview ?? ""}`.toLowerCase().includes(q);
    });
  }, [conversations, search, filter]);

  async function post(body: string, attachment: File | null) {
    if (!activeId) return;
    setSending(true);
    setError(null);
    const form = new FormData();
    form.set("body", body);
    if (attachment) form.set("file", attachment);
    try {
      const res = await fetch(`${apiBase}/conversations/${activeId}/messages`, { method: "POST", body: form });
      const json = await res.json().catch(() => null);
      if (!json?.ok) {
        setError(json?.error ?? "Could not send. Try again.");
      } else {
        setText("");
        setFile(null);
        await Promise.all([loadThread(activeId), loadList()]);
      }
    } finally {
      setSending(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending || (!text.trim() && !file)) return;
    post(text, file);
  }

  async function toggleRecord() {
    if (recording) {
      recorder.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      rec.ondataavailable = (ev) => ev.data.size && chunks.push(ev.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        const type = (rec.mimeType || "audio/webm").split(";")[0];
        const ext = type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm";
        const blob = new Blob(chunks, { type });
        if (blob.size) post("", new File([blob], `voice-note.${ext}`, { type }));
      };
      recorder.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      setError("Microphone access was blocked. Allow it in your browser to send voice notes.");
    }
  }

  async function startChat(clientId: string) {
    setNewOpen(false);
    const res = await fetch(`${apiBase}/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId }),
    });
    const json = await res.json().catch(() => null);
    if (json?.ok) {
      await loadList();
      setActiveId(json.id);
    }
  }

  const threadTitle = side === "client" ? (active?.title ?? "Messages") : (active?.client_name ?? "Messages");
  const showThreadOnMobile = !!activeId;

  return (
    <div className={cn("flex overflow-hidden rounded-3xl border border-stone-200/70 bg-white", className ?? "h-[calc(100vh-8rem)]")}>
      {/* conversation list */}
      <aside className={cn("w-full shrink-0 flex-col border-r border-stone-100 md:flex md:w-[340px]", showThreadOnMobile ? "hidden" : "flex")}>
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <h2 className="text-xl font-semibold tracking-tight">Messages</h2>
          {(side === "admin" || conversations.length === 0) && (
            <div className="relative">
              <button
                onClick={() => (side === "admin" ? setNewOpen((o) => !o) : loadList())}
                className="grid h-9 w-9 place-items-center rounded-full bg-orange-500 text-white hover:bg-orange-600"
                aria-label="New chat"
              >
                <Plus className="h-5 w-5" />
              </button>
              {newOpen && side === "admin" && (
                <div className="absolute right-0 z-10 mt-2 max-h-64 w-60 overflow-y-auto rounded-2xl border border-stone-200 bg-white py-1 shadow-xl">
                  {(clients ?? []).length === 0 && <p className="px-4 py-3 text-sm text-stone-400">No clients yet.</p>}
                  {(clients ?? []).map((c) => (
                    <button key={c.id} onClick={() => startChat(c.id)} className="block w-full px-4 py-2 text-left text-sm hover:bg-stone-50">
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="px-4">
          <div className="flex items-center gap-2 rounded-full bg-stone-100 px-3.5 py-2">
            <Search className="h-4 w-4 text-stone-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search chats and messages" className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400" />
          </div>
          <div className="mt-3 flex gap-1.5">
            {(["all", "unread"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn("rounded-full px-3 py-1 text-xs font-medium capitalize", filter === f ? "bg-orange-500 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200")}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex-1 overflow-y-auto">
          {!loaded ? (
            <p className="px-6 py-8 text-center text-sm text-stone-400">Loading...</p>
          ) : visible.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-stone-400">
              {conversations.length === 0 ? (side === "admin" ? "No conversations yet. Start one with the + button." : "No conversations yet.") : "Nothing matches."}
            </p>
          ) : (
            visible.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={cn("flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-stone-50", c.id === activeId && "bg-orange-50/70")}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-violet-50 text-sm font-semibold text-violet-700">
                  {initials(side === "client" ? c.title : c.client_name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate font-semibold">{side === "client" ? c.title : c.client_name}</p>
                    <p className="shrink-0 text-[11px] text-stone-400">{clock(c.last_message_at)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("truncate text-sm", c.unread ? "font-medium text-stone-800" : "text-stone-500")}>{c.last_preview ?? "No messages yet"}</p>
                    {c.unread > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white">{c.unread}</span>}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* thread */}
      <section className={cn("min-w-0 flex-1 flex-col bg-[#FBFAF9] md:flex", showThreadOnMobile ? "flex" : "hidden")}>
        {!active ? (
          <div className="grid flex-1 place-items-center px-6 text-center">
            <div>
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-stone-200 bg-white text-orange-500">
                <Send className="h-7 w-7" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{side === "client" ? "Chat with your agency" : "Select a conversation"}</h3>
              <p className="mx-auto mt-1 max-w-xs text-sm text-stone-500">
                {side === "client" ? "Send messages, photos, files and voice notes. You'll be notified the moment they reply." : "Pick a client on the left, or start a new chat with the + button."}
              </p>
            </div>
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-stone-100 bg-white px-4 py-3">
              <button onClick={() => setActiveId(null)} className="rounded-full p-1.5 text-stone-500 hover:bg-stone-100 md:hidden" aria-label="Back to chats">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-violet-50 text-sm font-semibold text-violet-700">{initials(threadTitle)}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{threadTitle}</p>
                <p className="text-xs text-stone-400">{side === "client" ? "The team usually replies within working hours" : "Client conversation"}</p>
              </div>
              {side === "admin" && active && (
                <a href={`/admin/clients/${active.client_id}`} className="text-sm font-medium text-orange-600 hover:underline">
                  View client
                </a>
              )}
            </header>

            <div className="flex-1 space-y-1.5 overflow-y-auto px-4 py-4">
              {messages.map((m, i) => {
                const mine = m.sender_type === side;
                const newDay = i === 0 || new Date(m.created_at).toDateString() !== new Date(messages[i - 1].created_at).toDateString();
                return (
                  <div key={m.id}>
                    {newDay && (
                      <div className="my-3 flex justify-center">
                        <span className="rounded-full border border-stone-200 bg-white px-3 py-0.5 text-[11px] text-stone-500">{dayLabel(m.created_at)}</span>
                      </div>
                    )}
                    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-sm", mine ? "bg-orange-500 text-white" : "border border-stone-200 bg-white text-stone-800")}>
                        {!mine && side === "admin" && m.sender_name && <p className="mb-0.5 text-[11px] font-semibold opacity-70">{m.sender_name}</p>}
                        {m.attachment_name && <Attachment m={m} mine={mine} base={attachmentBase} />}
                        {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                        <p className={cn("mt-0.5 text-right text-[10px]", mine ? "text-orange-100" : "text-stone-400")}>
                          {clock(m.created_at)}
                          {mine && m.read_at && " ✓✓"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={onSubmit} className="border-t border-stone-100 bg-white p-3">
              {file && (
                <div className="mb-2 flex items-center gap-2 rounded-xl bg-stone-50 px-3 py-2 text-sm">
                  <FileText className="h-4 w-4 text-stone-400" />
                  <span className="min-w-0 flex-1 truncate">{file.name}</span>
                  <button type="button" onClick={() => setFile(null)} aria-label="Remove file" className="text-stone-400 hover:text-stone-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
              <div className="flex items-end gap-2">
                <input ref={fileInput} type="file" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                <button type="button" onClick={() => fileInput.current?.click()} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-stone-500 hover:bg-stone-100" aria-label="Attach a file">
                  <Paperclip className="h-5 w-5" />
                </button>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onSubmit(e);
                    }
                  }}
                  rows={1}
                  placeholder={recording ? "Recording... tap the square to send" : "Message"}
                  disabled={recording}
                  className="max-h-32 min-h-10 flex-1 resize-none rounded-3xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                />
                {text.trim() || file ? (
                  <button type="submit" disabled={sending} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50" aria-label="Send">
                    <Send className="h-[18px] w-[18px]" />
                  </button>
                ) : (
                  <button type="button" onClick={toggleRecord} className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full text-white", recording ? "animate-pulse bg-red-500" : "bg-orange-500 hover:bg-orange-600")} aria-label={recording ? "Stop and send voice note" : "Record a voice note"}>
                    {recording ? <Square className="h-4 w-4 fill-current" /> : <Mic className="h-[18px] w-[18px]" />}
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

function Attachment({ m, mine, base }: { m: ChatMessage; mine: boolean; base: string }) {
  const url = `${base}/${m.id}/attachment`;
  if (m.attachment_type?.startsWith("image/")) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="mb-1 block">
        {/* eslint-disable-next-line @next/next/no-img-element -- private signed redirect, not optimisable */}
        <img src={url} alt={m.attachment_name ?? "Image"} className="max-h-60 rounded-xl" loading="lazy" />
      </a>
    );
  }
  if (m.attachment_type?.startsWith("audio/")) {
    return <audio controls src={url} className="mb-1 h-10 max-w-full" preload="none" />;
  }
  return (
    <a href={url} className={cn("mb-1 flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium", mine ? "bg-orange-600/60" : "bg-stone-100")}>
      <FileText className="h-4 w-4 shrink-0" />
      <span className="truncate">{m.attachment_name}</span>
    </a>
  );
}

export type { ChatSide };

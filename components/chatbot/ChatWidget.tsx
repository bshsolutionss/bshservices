"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { GREETING, STARTER_PROMPTS } from "@/lib/chatbot/config";

/**
 * Floating AI assistant, mounted site-wide by components/SiteChrome.tsx.
 *
 * Answers come from /api/chat, which grounds the model on the site's own
 * services, pricing and FAQ content — so this widget holds no copy of that
 * information and never needs updating when a price changes.
 *
 * Placed bottom-right but raised a row so it clears InstallAppButton's
 * floating pill (bottom-right) and WhatsAppButton (bottom-left).
 */

/** Mirrors lib/chatbot/knowledge.ts's Region — declared locally so this
 *  client component never reaches into a server-only module. */
type Region = "GLOBAL" | "PK";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatApiResponse {
  reply?: string;
  suggestions?: string[];
  leadCaptured?: boolean;
  error?: string;
}

const STORAGE_KEY = "bsh-chat-session";

/** Survives client-side navigation and tab-local reloads; deliberately not
 *  localStorage, so a shared or public machine doesn't keep the transcript. */
interface StoredSession {
  messages: ChatMessage[];
  leadCaptured: boolean;
}

function loadSession(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (!Array.isArray(parsed?.messages)) return null;
    return { messages: parsed.messages, leadCaptured: parsed.leadCaptured === true };
  } catch {
    return null;
  }
}

function saveSession(session: StoredSession): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Private mode / blocked storage — the chat still works, it just won't
    // survive a reload.
  }
}

/** Turns the plain-text answer's site paths, emails and URLs into real links.
 *  Built by splitting on a pattern rather than injecting HTML, so nothing the
 *  model returns can become markup. */
const LINK_PATTERN =
  /(https?:\/\/[^\s)]+|[^\s<>()]+@[^\s<>()]+\.[a-z]{2,}|\/(?:[A-Za-z0-9#\-_]+)(?:\/[A-Za-z0-9#\-_]+)*)/g;

function MessageText({ text }: { text: string }) {
  const parts = text.split(LINK_PATTERN);

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;

        // Odd indices are the captured separators — i.e. the matched links.
        if (index % 2 === 1) {
          if (part.includes("@") && !part.startsWith("http")) {
            return (
              <a key={index} href={`mailto:${part}`} className="font-semibold underline">
                {part}
              </a>
            );
          }
          if (part.startsWith("http")) {
            return (
              <a
                key={index}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline"
              >
                {part}
              </a>
            );
          }
          return (
            <Link key={index} href={part} className="font-semibold underline">
              {part}
            </Link>
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
}

export default function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = React.useState<string[]>([...STARTER_PROMPTS]);
  const [leadCaptured, setLeadCaptured] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [region, setRegion] = React.useState<Region>("GLOBAL");

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Same cookie the pricing section reads (written by proxy.ts), so a visitor
  // in Pakistan is quoted PKR instead of USD.
  React.useEffect(() => {
    const match = document.cookie.match(/(?:^|; )user-region=(GLOBAL|PK)/);
    if (match) setRegion(match[1] as Region);

    const stored = loadSession();
    if (stored?.messages.length) {
      setMessages(stored.messages);
      setLeadCaptured(stored.leadCaptured);
      setSuggestions([]);
    }
  }, []);

  React.useEffect(() => {
    if (messages.length) saveSession({ messages, leadCaptured });
  }, [messages, leadCaptured]);

  // Pin to the newest message as the conversation grows.
  React.useEffect(() => {
    if (!isOpen) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending, isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const send = React.useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || isSending) return;

      const nextMessages: ChatMessage[] = [...messages, { role: "user", content: question }];
      setMessages(nextMessages);
      setInput("");
      setSuggestions([]);
      setIsSending(true);
      trackEvent("chatbot_message", { page: pathname || "/" });

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextMessages,
            region,
            pagePath: pathname,
            leadCaptured,
          }),
        });

        const data: ChatApiResponse = await response.json().catch(() => ({}));

        if (data.reply) {
          setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
          setSuggestions(data.suggestions?.slice(0, 3) ?? []);
          if (data.leadCaptured && !leadCaptured) {
            setLeadCaptured(true);
            trackEvent("chatbot_lead_captured", { page: pathname || "/" });
          }
        } else {
          setMessages([
            ...nextMessages,
            {
              role: "assistant",
              content:
                "Sorry — something went wrong on my side. You can reach the team directly at info@bshsolutions.net or book a free call at /book-consultation.",
            },
          ]);
        }
      } catch {
        setMessages([
          ...nextMessages,
          {
            role: "assistant",
            content:
              "I couldn't connect just now. Please check your connection, or email info@bshsolutions.net and the team will help.",
          },
        ]);
      } finally {
        setIsSending(false);
        inputRef.current?.focus();
      }
    },
    [isSending, messages, pathname, region, leadCaptured]
  );

  // The admin panel renders its own shell and has no use for a sales chatbot.
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      {/* ====== Launcher ====== */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              setIsOpen(true);
              trackEvent("chatbot_open", { page: pathname || "/" });
            }}
            aria-label="Open the BSH Solutions assistant"
            className="fixed bottom-[5.5rem] right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#1A14A5] text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <MessageCircle className="h-7 w-7" />
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#F4F7FE] text-[#1A14A5] ring-2 ring-[#1A14A5]">
              <Sparkles className="h-3 w-3" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ====== Panel ====== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            role="dialog"
            aria-modal="false"
            aria-label="BSH Solutions assistant"
            className="fixed inset-x-4 bottom-4 z-[60] flex max-h-[min(78vh,38rem)] flex-col overflow-hidden rounded-3xl border border-[#1A14A5]/10 bg-white shadow-2xl sm:inset-x-auto sm:right-4 sm:w-[23.5rem]"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 bg-[#1A14A5] px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold leading-tight">BSH Assistant</p>
                  <p className="text-xs text-white/70">Services, pricing & bookings</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close the assistant"
                className="rounded-full p-1.5 transition-colors hover:bg-white/15"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Transcript */}
            <div
              ref={scrollRef}
              role="log"
              aria-live="polite"
              aria-label="Conversation"
              className="flex-1 space-y-3 overflow-y-auto bg-[#F4F7FE] px-4 py-4"
            >
              <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm leading-relaxed text-[#231F20] shadow-sm">
                {GREETING}
              </div>

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={
                    message.role === "user"
                      ? "ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-[#1A14A5] px-4 py-3 text-sm leading-relaxed text-white shadow-sm"
                      : "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm leading-relaxed text-[#231F20] shadow-sm"
                  }
                >
                  {message.role === "assistant" ? (
                    <MessageText text={message.content} />
                  ) : (
                    message.content
                  )}
                </div>
              ))}

              {isSending && (
                <div className="flex max-w-[85%] items-center gap-1.5 rounded-2xl rounded-bl-md bg-white px-4 py-4 shadow-sm">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="h-2 w-2 animate-bounce rounded-full bg-[#1A14A5]/40"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                  <span className="sr-only">The assistant is typing…</span>
                </div>
              )}
            </div>

            {/* Suggestion chips */}
            {suggestions.length > 0 && !isSending && (
              <div className="flex flex-wrap gap-2 border-t border-[#1A14A5]/10 bg-white px-4 pt-3">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => send(suggestion)}
                    className="rounded-full border border-[#1A14A5]/20 bg-[#F4F7FE] px-3 py-1.5 text-xs font-semibold text-[#1A14A5] transition-colors hover:bg-[#1A14A5] hover:text-white"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Composer */}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 bg-white px-4 py-3"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                maxLength={1000}
                placeholder="Ask about services or pricing…"
                aria-label="Your message"
                className="min-w-0 flex-1 rounded-2xl border border-[#1A14A5]/15 bg-[#F4F7FE] px-4 py-2.5 text-sm text-[#231F20] outline-none transition-colors placeholder:text-[#231F20]/40 focus:border-[#1A14A5]"
              />
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1A14A5] text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            <p className="bg-white px-4 pb-3 text-center text-[11px] leading-snug text-[#231F20]/45">
              AI assistant — details are confirmed by our team.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

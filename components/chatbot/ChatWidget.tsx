"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarCheck,
  Compass,
  Info,
  MessageCircle,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { trackEvent } from "@/lib/analytics";
import { buildWhatsAppUrl, DEFAULT_WHATSAPP_MESSAGE } from "@/lib/whatsapp";
import { ASSISTANT_NAME, BUSINESS_FACTS, GREETING, STARTER_PROMPTS } from "@/lib/chatbot/config";
import { getNudges, getPageGuide, type GuideAction, type GuideButton, type Nudge, type Region } from "@/lib/chatbot/guide";
import Mascot, { type MascotMood } from "@/components/chatbot/Mascot";
import QuoteBuilder from "@/components/chatbot/QuoteBuilder";
import SiteTour from "@/components/chatbot/SiteTour";

/**
 * Hubi, the site-wide sales guide, mounted by components/SiteChrome.tsx.
 *
 * The mascot in the bottom-right corner opens a menu of four ways in:
 *  - Ask anything:      the AI chat (/api/chat, grounded on the site's own
 *                       services, pricing and FAQ content)
 *  - Instant estimate:  three taps to a real package and price, then a lead
 *  - Tour:              a spotlight walkthrough of the homepage
 *  - This page:         a plain explanation of where the visitor is
 *
 * Between those, it speaks up once or twice per session with a nudge that
 * fits the page (see getNudges in lib/chatbot/guide.ts), the way a good
 * salesperson notices someone lingering on the price list.
 *
 * The launcher sits at bottom-right, mirroring WhatsAppButton (bottom-left).
 */

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

type View = "closed" | "menu" | "chat" | "quote" | "page";

const STORAGE_KEY = "bsh-chat-session";
const NUDGES_KEY = "bsh-hubi-nudges";
/** A guide who talks too much stops being helpful. */
const MAX_NUDGES_PER_SESSION = 2;
const NUDGE_VISIBLE_MS = 14000;
/** How often the idle launcher shakes for attention: often until the visitor
 *  has opened Hubi once, then rarely, so it never becomes noise. */
const SHAKE_EVERY_MS = 7000;
const SHAKE_EVERY_AFTER_OPEN_MS = 30000;

const SHAKE = {
  rotate: [0, -14, 12, -10, 8, -4, 0],
  scale: [1, 1.1, 1.1, 1.06, 1.06, 1.02, 1],
};

/** A short buzz on phones that support it (Android Chrome). Browsers ignore
 *  it until the visitor has interacted with the page, which is what we want. */
function haptic(pattern: number | number[]): void {
  try {
    const nav = navigator as Navigator & { userActivation?: { hasBeenActive: boolean } };
    if (nav.userActivation && !nav.userActivation.hasBeenActive) return;
    nav.vibrate?.(pattern);
  } catch {
    // Unsupported, nothing to do.
  }
}

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

function clearSession(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored to clear.
  }
}

function shownNudges(): string[] {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(NUDGES_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function markNudgeShown(id: string): void {
  try {
    sessionStorage.setItem(NUDGES_KEY, JSON.stringify([...shownNudges(), id]));
  } catch {
    // Without storage the nudge may repeat after a reload; harmless.
  }
}

/** The page's own name, so the widget can talk about "Shopify Store
 *  Development" rather than "this page". The <title> before " | BSH
 *  Solutions" is preferred: service <h1>s are long marketing lines that read
 *  badly inside "How much is …?". */
function readPageHeading(): string {
  const fromTitle = document.title.split("|")[0]?.trim() ?? "";
  const fromH1 = document.querySelector("main h1")?.textContent?.replace(/\s+/g, " ").trim() ?? "";
  const heading = fromTitle && !/^bsh solutions$/i.test(fromTitle) ? fromTitle : fromH1;
  return heading.slice(0, 80);
}

function scrollToSelector(selector: string): void {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top = element.getBoundingClientRect().top + window.scrollY - 90;
  window.scrollTo({ top: Math.max(top, 0), behavior: reduce ? "auto" : "smooth" });
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
              <a key={index} href={`mailto:${part}`} className="font-semibold text-[#1A14A5] underline">
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
                className="font-semibold text-[#1A14A5] underline"
              >
                {part}
              </a>
            );
          }
          return (
            <Link key={index} href={part} className="font-semibold text-[#1A14A5] underline">
              {part}
            </Link>
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
}

/** Hubi's face in a soft tile, for the panel header and transcript. */
function HubiAvatar({ size = 32, mood = "idle" }: { size?: number; mood?: MascotMood }) {
  return (
    <span
      className="flex shrink-0 items-end justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#EEF1FD] to-[#DDE3FA]"
      style={{ width: size, height: size }}
    >
      <Mascot size={size * 0.92} mood={mood} className="translate-y-[6%]" />
    </span>
  );
}

/** Chips shown under the greeting before the visitor has typed anything. */
function openingChips(pathname: string, heading: string): GuideButton[] {
  const isServiceDetail = /^\/services\/[^/]+\/[^/]+/i.test(pathname);
  const questions = isServiceDetail && heading
    ? [`How much is ${heading}?`, "What's included?", "How long does it take?"]
    : [...STARTER_PROMPTS].slice(0, 3);

  return [
    { label: "Instant price estimate", action: { kind: "quote" } },
    ...questions.map((question) => ({ label: question, action: { kind: "ask", question } as GuideAction })),
  ];
}

export default function ChatWidget() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [view, setView] = React.useState<View>("closed");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [leadCaptured, setLeadCaptured] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [region, setRegion] = React.useState<Region>("GLOBAL");
  const [heading, setHeading] = React.useState("");
  const [tourActive, setTourActive] = React.useState(false);
  const [tourPending, setTourPending] = React.useState(false);
  const [nudge, setNudge] = React.useState<Nudge | null>(null);
  const [launcherHover, setLauncherHover] = React.useState(false);
  const [celebrating, setCelebrating] = React.useState(false);
  const [hasOpened, setHasOpened] = React.useState(false);
  const shakeControls = useAnimationControls();

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const launcherRef = React.useRef<HTMLButtonElement>(null);

  // Same cookie the pricing section reads (written by proxy.ts), so a visitor
  // in Pakistan is quoted PKR instead of USD.
  React.useEffect(() => {
    const match = document.cookie.match(/(?:^|; )user-region=(GLOBAL|PK)/);
    if (match) setRegion(match[1] as Region);

    const stored = loadSession();
    if (stored?.messages.length) {
      setMessages(stored.messages);
      setLeadCaptured(stored.leadCaptured);
    }
  }, []);

  React.useEffect(() => {
    if (messages.length) saveSession({ messages, leadCaptured });
  }, [messages, leadCaptured]);

  // A new page means a new heading, and the old page's nudge no longer fits.
  React.useEffect(() => {
    setNudge(null);
    const timer = setTimeout(() => setHeading(readPageHeading()), 400);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Pin to the newest message as the conversation grows.
  React.useEffect(() => {
    if (view !== "chat") return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending, view]);

  React.useEffect(() => {
    if (view === "chat") inputRef.current?.focus();
  }, [view]);

  React.useEffect(() => {
    if (view === "closed") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setView("closed");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [view]);

  // On phones the panel is a bottom sheet; keep the page behind it still.
  React.useEffect(() => {
    const sheetOpen = view === "chat" || view === "quote" || view === "page";
    if (!sheetOpen || window.matchMedia("(min-width: 640px)").matches) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [view]);

  // The menu is a popover: a click anywhere else dismisses it.
  React.useEffect(() => {
    if (view !== "menu") return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || launcherRef.current?.contains(target)) return;
      setView("closed");
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [view]);

  // ---- Proactive nudges -------------------------------------------------
  // A ref, so a nudge timer started on page load checks whether the visitor
  // is busy *now* rather than when the timer was set.
  const busyRef = React.useRef(false);
  React.useEffect(() => {
    busyRef.current = view !== "closed" || tourActive || tourPending;
  }, [view, tourActive, tourPending]);

  React.useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const already = shownNudges();
    if (already.length >= MAX_NUDGES_PER_SESSION) return;

    const pending = getNudges(pathname).filter((candidate) => !already.includes(candidate.id));
    const cleanups: (() => void)[] = [];

    const fire = (candidate: Nudge) => {
      if (busyRef.current || shownNudges().length >= MAX_NUDGES_PER_SESSION) return;
      if (shownNudges().includes(candidate.id)) return;
      markNudgeShown(candidate.id);
      setNudge((current) => current ?? candidate);
      trackEvent("chatbot_nudge_shown", { page: pathname, nudge: candidate.id });
    };

    for (const candidate of pending) {
      if (!candidate.whenVisible) {
        const timer = setTimeout(() => fire(candidate), candidate.delayMs);
        cleanups.push(() => clearTimeout(timer));
        continue;
      }

      // Section-triggered: the clock only runs while the section is on
      // screen. Sections can mount late (dynamic imports), so look for it
      // a few times before giving up.
      let observer: IntersectionObserver | undefined;
      let dwell: ReturnType<typeof setTimeout> | undefined;
      let attempts = 0;
      const attach = () => {
        const element = document.querySelector(candidate.whenVisible!);
        if (!element) {
          if (attempts++ < 20) poll = setTimeout(attach, 500);
          return;
        }
        observer = new IntersectionObserver(
          ([entry]) => {
            clearTimeout(dwell);
            if (entry.isIntersecting) dwell = setTimeout(() => fire(candidate), candidate.delayMs);
          },
          { threshold: 0.35 }
        );
        observer.observe(element);
      };
      let poll: ReturnType<typeof setTimeout> | undefined = setTimeout(attach, 300);
      cleanups.push(() => {
        clearTimeout(poll);
        clearTimeout(dwell);
        observer?.disconnect();
      });
    }

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [pathname]);

  React.useEffect(() => {
    if (!nudge) return;
    const timer = setTimeout(() => setNudge(null), NUDGE_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [nudge]);

  // ---- Attention shake --------------------------------------------------
  const launcherVisible = view === "closed" && !tourActive && !tourPending;

  React.useEffect(() => {
    if (reduceMotion || !launcherVisible || launcherHover) return;
    const interval = setInterval(
      () => shakeControls.start(SHAKE, { duration: 0.75, ease: "easeInOut" }),
      hasOpened ? SHAKE_EVERY_AFTER_OPEN_MS : SHAKE_EVERY_MS
    );
    return () => clearInterval(interval);
  }, [reduceMotion, launcherVisible, launcherHover, hasOpened, shakeControls]);

  // A nudge arriving is the moment to really catch the eye.
  React.useEffect(() => {
    if (!nudge) return;
    if (!reduceMotion) shakeControls.start(SHAKE, { duration: 0.75, ease: "easeInOut" });
    haptic([30, 60, 30]);
  }, [nudge, reduceMotion, shakeControls]);

  // ---- Tour -------------------------------------------------------------
  const startTour = React.useCallback(() => {
    setView("closed");
    setNudge(null);
    trackEvent("chatbot_tour_start", { page: pathname });
    if (pathname === "/") {
      setTourActive(true);
    } else {
      setTourPending(true);
      router.push("/");
    }
  }, [pathname, router]);

  React.useEffect(() => {
    if (tourPending && pathname === "/") {
      setTourPending(false);
      setTourActive(true);
    }
  }, [tourPending, pathname]);

  const closeTour = React.useCallback(
    (completed: boolean) => {
      setTourActive(false);
      trackEvent(completed ? "chatbot_tour_complete" : "chatbot_tour_skip", { page: pathname });
    },
    [pathname]
  );

  const planFromTour = React.useCallback(() => {
    setTourActive(false);
    trackEvent("chatbot_tour_complete", { page: pathname });
    setView("quote");
  }, [pathname]);

  // ---- Chat -------------------------------------------------------------
  const send = React.useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || isSending) return;

      const nextMessages: ChatMessage[] = [...messages, { role: "user", content: question }];
      setMessages(nextMessages);
      setInput("");
      setSuggestions([]);
      setIsSending(true);
      trackEvent("chatbot_message", { page: pathname });

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
            setCelebrating(true);
            trackEvent("chatbot_lead_captured", { page: pathname });
          }
        } else {
          setMessages([
            ...nextMessages,
            {
              role: "assistant",
              content: `Sorry, something went wrong on my side. You can reach the team directly at ${BUSINESS_FACTS.emails.general} or book a free call at ${BUSINESS_FACTS.paths.booking}.`,
            },
          ]);
        }
      } catch {
        setMessages([
          ...nextMessages,
          {
            role: "assistant",
            content: `I couldn't connect just now. Please check your connection, or email ${BUSINESS_FACTS.emails.general} and the team will help.`,
          },
        ]);
      } finally {
        setIsSending(false);
        inputRef.current?.focus();
      }
    },
    [isSending, messages, pathname, region, leadCaptured]
  );

  React.useEffect(() => {
    if (!celebrating) return;
    const timer = setTimeout(() => setCelebrating(false), 4000);
    return () => clearTimeout(timer);
  }, [celebrating]);

  const resetChat = () => {
    setMessages([]);
    setSuggestions([]);
    setInput("");
    clearSession();
    trackEvent("chatbot_reset", { page: pathname });
  };

  /** Hands the visitor to a human on WhatsApp without making them repeat
   *  themselves: the opening message carries their latest question. */
  const lastQuestion = [...messages].reverse().find((message) => message.role === "user")?.content;
  const whatsAppHref = buildWhatsAppUrl(
    lastQuestion
      ? `Hi BSH Solutions! I was chatting with ${ASSISTANT_NAME} on your website about: "${lastQuestion.slice(0, 300)}". Can you help?`
      : DEFAULT_WHATSAPP_MESSAGE
  );

  const open = (next: View, source: string) => {
    if (next !== "menu" && next !== "closed") setHeading(readPageHeading());
    setNudge(null);
    setView(next);
    setHasOpened(true);
    trackEvent("chatbot_open", { page: pathname, mode: next, source });
  };

  const runAction = (action: GuideAction, source: string) => {
    switch (action.kind) {
      case "ask":
        open("chat", source);
        send(action.question);
        break;
      case "quote":
        open("quote", source);
        break;
      case "tour":
        startTour();
        break;
      case "scroll":
        setView("closed");
        scrollToSelector(action.selector);
        break;
      case "link":
        setView("closed");
        router.push(action.href);
        break;
    }
  };

  // The admin panel renders its own shell and has no use for a sales chatbot.
  if (pathname.startsWith("/admin")) return null;

  const panelOpen = view === "chat" || view === "quote" || view === "page";
  const launcherMood: MascotMood = celebrating
    ? "happy"
    : isSending
      ? "thinking"
      : launcherHover || nudge || view === "menu"
        ? "wave"
        : "idle";
  const headerMood: MascotMood = celebrating ? "happy" : isSending ? "thinking" : "idle";
  const pageGuide = view === "page" ? getPageGuide(pathname, heading) : null;
  const pop = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 16, scale: 0.96 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 16, scale: 0.96 },
      };

  const menuItems: { icon: React.ReactNode; title: string; hint: string; onClick: () => void; primary?: boolean }[] = [
    ...(messages.length
      ? [
          {
            icon: <MessageCircle className="h-5 w-5" />,
            title: "Continue our chat",
            hint: "Pick up where we left off",
            onClick: () => open("chat", "menu"),
          },
        ]
      : []),
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: "Instant price estimate",
      hint: "3 quick taps, real package prices",
      onClick: () => open("quote", "menu"),
      primary: true,
    },
    ...(messages.length
      ? []
      : [
          {
            icon: <MessageCircle className="h-5 w-5" />,
            title: "Ask me anything",
            hint: "Services, pricing, timelines",
            onClick: () => open("chat", "menu"),
          },
        ]),
    {
      icon: <Compass className="h-5 w-5" />,
      title: "Take the 60-second tour",
      hint: "See everything we do",
      onClick: startTour,
    },
    {
      icon: <Info className="h-5 w-5" />,
      title: "What's on this page?",
      hint: "I'll explain where you are",
      onClick: () => open("page", "menu"),
    },
  ];

  return (
    <>
      {/* ====== Launcher: Hubi himself ====== */}
      <AnimatePresence>
        {!panelOpen && !tourActive && (
          <motion.button
            ref={launcherRef}
            {...pop}
            transition={{ duration: 0.2 }}
            onClick={() => {
              haptic(12);
              if (view === "menu") setView("closed");
              else open("menu", nudge ? "nudge_mascot" : "launcher");
            }}
            onPointerEnter={() => setLauncherHover(true)}
            onPointerLeave={() => setLauncherHover(false)}
            aria-label={`Open ${ASSISTANT_NAME}, the BSH Solutions guide`}
            aria-expanded={view === "menu"}
            className="group fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-50 flex items-center focus-visible:outline-none"
          >
            <span className="pointer-events-none absolute -left-3 top-1/2 -translate-x-full -translate-y-1/2 whitespace-nowrap rounded-full bg-[#231F20] px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 max-sm:hidden">
              Ask {ASSISTANT_NAME}
            </span>

            {/* The shake lives on its own wrapper so it never fights the
                enter/exit animation on the button. */}
            <motion.span animate={shakeControls} className="relative block">
              {/* Pulse rings: a light page background swallows a white robot,
                  so the navy disc and its halo carry the contrast. */}
              {reduceMotion ? (
                // Nothing moves for visitors who asked for less motion; a
                // fading glow still draws the eye.
                <span className="absolute -inset-2 animate-pulse rounded-full bg-[#1A14A5]/25 blur-[3px]" />
              ) : (
                <>
                  <span className="absolute inset-0 animate-ping rounded-full bg-[#1A14A5]/30 [animation-duration:2.4s]" />
                  <span className="absolute -inset-1.5 rounded-full bg-[#1A14A5]/10 blur-[2px]" />
                </>
              )}
              <span className="relative flex h-[60px] w-[60px] items-end justify-center rounded-full bg-gradient-to-br from-[#2B24E0] via-[#1A14A5] to-[#0E0A6B] shadow-[0_12px_28px_-6px_rgba(26,20,165,0.65),0_0_0_3px_#FFFFFF] transition-transform group-hover:-translate-y-0.5 group-hover:scale-105 group-active:scale-95 group-focus-visible:ring-4 group-focus-visible:ring-[#1A14A5]/40 sm:h-16 sm:w-16">
                <Mascot
                  size={56}
                  mood={launcherMood}
                  trackPointer
                  className="-mb-0.5 h-auto w-[50px] drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)] sm:w-[54px]"
                />
              </span>
              <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#25D366]" />
              {nudge && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#E5484D] text-[10px] font-bold text-white">
                  1
                </span>
              )}
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ====== Nudge bubble ====== */}
      <AnimatePresence>
        {nudge && view === "closed" && !tourActive && (
          <motion.div
            {...pop}
            transition={{ duration: 0.22 }}
            role="status"
            className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-4 z-50 w-[min(17rem,calc(100vw-2rem))] rounded-2xl rounded-br-md border border-[#1A14A5]/10 bg-white p-4 shadow-xl"
          >
            <button
              onClick={() => {
                setNudge(null);
                trackEvent("chatbot_nudge_dismiss", { page: pathname, nudge: nudge.id });
              }}
              aria-label="Dismiss"
              className="absolute right-2 top-2 rounded-full p-1 text-[#231F20]/40 transition-colors hover:bg-[#F4F7FE] hover:text-[#231F20]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <p className="pr-4 text-sm leading-snug text-[#231F20]">{nudge.text}</p>
            <button
              onClick={() => {
                trackEvent("chatbot_nudge_click", { page: pathname, nudge: nudge.id });
                runAction(nudge.button.action, "nudge");
              }}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#1A14A5] px-3.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              {nudge.button.label} <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== Menu ====== */}
      <AnimatePresence>
        {view === "menu" && (
          <motion.div
            ref={menuRef}
            {...pop}
            transition={{ duration: 0.2, ease: "easeOut" }}
            role="menu"
            aria-label={`${ASSISTANT_NAME} menu`}
            className="fixed inset-x-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-[60] max-h-[calc(100dvh-7.5rem)] origin-bottom-right overflow-y-auto overscroll-contain rounded-3xl border border-[#1A14A5]/10 bg-white p-2 shadow-2xl sm:inset-x-auto sm:right-4 sm:w-[20rem]"
          >
            <div className="px-3 pb-2 pt-3">
              <p className="text-lg font-bold text-[#231F20]">Hi, I&apos;m {ASSISTANT_NAME}</p>
              <p className="text-sm text-[#231F20]/60">Your BSH Solutions guide. How can I help?</p>
            </div>

            <div className="space-y-0.5">
              {menuItems.map((item) => (
                <button
                  key={item.title}
                  role="menuitem"
                  onClick={item.onClick}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${
                    item.primary ? "bg-[#F4F7FE] hover:bg-[#E8EDFC]" : "hover:bg-[#F4F7FE]"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      item.primary ? "bg-[#1A14A5] text-white" : "bg-[#231F20] text-white"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-[#231F20]">{item.title}</span>
                    <span className="block truncate text-xs text-[#231F20]/55">{item.hint}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#1A14A5]/10 px-1 pb-1 pt-3">
              <a
                href={whatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("whatsapp_click", { source: "chatbot_menu" })}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              >
                <FaWhatsapp className="h-4 w-4" /> WhatsApp us
              </a>
              <Link
                href={BUSINESS_FACTS.paths.booking}
                onClick={() => {
                  setView("closed");
                  trackEvent("chatbot_booking_click", { page: pathname, source: "menu" });
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-[#1A14A5]/20 px-3 py-2.5 text-xs font-semibold text-[#1A14A5] transition-colors hover:bg-[#F4F7FE]"
              >
                <CalendarCheck className="h-4 w-4" /> Free call
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== Panel: chat, estimate or page guide ======
          A bottom sheet on phones (with a tap-to-close backdrop), a floating
          card from sm up. */}
      <AnimatePresence>
        {panelOpen && (
          <motion.button
            key="backdrop"
            aria-label="Close"
            tabIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setView("closed")}
            className="fixed inset-0 z-[59] bg-[#0F0D28]/40 backdrop-blur-[2px] sm:hidden"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            {...pop}
            transition={{ duration: 0.22, ease: "easeOut" }}
            role="dialog"
            aria-modal="false"
            aria-label={`${ASSISTANT_NAME}, BSH Solutions guide`}
            className={`fixed inset-x-0 bottom-0 z-[60] flex ${
              view === "page" ? "max-h-[88dvh] sm:max-h-[min(82vh,40rem)]" : "h-[88dvh] sm:h-[min(82vh,40rem)]"
            } flex-col overflow-hidden rounded-t-3xl border border-[#1A14A5]/10 bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl sm:inset-x-auto sm:bottom-4 sm:right-4 sm:w-[24.5rem] sm:rounded-3xl sm:pb-0`}
          >
            <span aria-hidden="true" className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-[#231F20]/15 sm:hidden" />
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-[#1A14A5]/10 px-3 py-3">
              <button
                onClick={() => setView("menu")}
                aria-label="Back to menu"
                className="rounded-full p-2 text-[#231F20]/50 transition-colors sm:p-1.5 hover:bg-[#F4F7FE] hover:text-[#1A14A5]"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <HubiAvatar size={40} mood={headerMood} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-sm font-bold leading-tight text-[#231F20]">
                  {ASSISTANT_NAME}
                  <span className="h-2 w-2 rounded-full bg-[#25D366]" aria-label="online" />
                </p>
                <p className="truncate text-xs text-[#231F20]/55">
                  {isSending
                    ? "Typing…"
                    : view === "quote"
                      ? "Instant estimate"
                      : view === "page"
                        ? "About this page"
                        : "Online now"}
                </p>
              </div>
              <a
                href={whatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("whatsapp_click", { source: `chatbot_${view}_header` })}
                className="flex items-center gap-1.5 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-3 py-1.5 text-xs font-semibold text-[#128C4B] transition-colors hover:bg-[#25D366]/20"
              >
                <FaWhatsapp className="h-3.5 w-3.5" />
                <span className="max-[360px]:hidden">WhatsApp</span>
              </a>
              {view === "chat" && messages.length > 0 && (
                <button
                  onClick={resetChat}
                  aria-label="Start a new conversation"
                  title="Start over"
                  className="rounded-full p-2 text-[#231F20]/50 transition-colors sm:p-1.5 hover:bg-[#F4F7FE] hover:text-[#1A14A5]"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setView("closed")}
                aria-label="Close"
                className="rounded-full p-2 text-[#231F20]/50 transition-colors sm:p-1.5 hover:bg-[#F4F7FE] hover:text-[#231F20]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {view === "quote" && (
              <QuoteBuilder
                region={region}
                pagePath={pathname}
                leadCaptured={leadCaptured}
                onLeadCaptured={() => {
                  setLeadCaptured(true);
                  setCelebrating(true);
                }}
                onAsk={(question) => runAction({ kind: "ask", question }, "quote")}
              />
            )}

            {view === "page" && pageGuide && (
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <div className="flex items-start gap-3">
                  <HubiAvatar size={44} mood="point" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#1A14A5]/70">You are here</p>
                    <h3 className="mt-0.5 text-base font-bold leading-snug text-[#231F20]">{pageGuide.title}</h3>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#231F20]/75">{pageGuide.body}</p>
                <div className="mt-5 grid gap-2">
                  {pageGuide.buttons.map((button, index) => (
                    <button
                      key={button.label}
                      onClick={() => runAction(button.action, "page_guide")}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                        index === 0
                          ? "bg-[#1A14A5] text-white hover:opacity-90"
                          : "border border-[#1A14A5]/15 text-[#1A14A5] hover:bg-[#F4F7FE]"
                      }`}
                    >
                      {button.label}
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  ))}
                  <button
                    onClick={() => open("chat", "page_guide")}
                    className="mt-1 text-xs font-medium text-[#231F20]/55 hover:text-[#1A14A5]"
                  >
                    Or ask me something else
                  </button>
                </div>
              </div>
            )}

            {view === "chat" && (
              <>
                {/* Transcript */}
                <div
                  ref={scrollRef}
                  role="log"
                  aria-live="polite"
                  aria-label="Conversation"
                  className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-[#F7F8FC] px-4 py-4"
                >
                  <div className="flex items-end gap-2">
                    <HubiAvatar size={30} />
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm leading-relaxed text-[#231F20] shadow-sm">
                      {GREETING}
                      {messages.length === 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5 whitespace-normal">
                          {openingChips(pathname, heading).map((chip, index) => (
                            <button
                              key={chip.label}
                              onClick={() => runAction(chip.action, "chat_opening")}
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                                index === 0
                                  ? "bg-[#1A14A5] text-white hover:opacity-90"
                                  : "border border-[#1A14A5]/20 bg-white text-[#1A14A5] hover:bg-[#F4F7FE]"
                              }`}
                            >
                              {index === 0 && <Sparkles className="mr-1 inline h-3 w-3" />}
                              {chip.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {messages.map((message, index) => {
                    if (message.role === "user") {
                      return (
                        <div
                          key={index}
                          className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-[#1A14A5] px-4 py-3 text-sm leading-relaxed text-white shadow-sm"
                        >
                          {message.content}
                        </div>
                      );
                    }

                    // Hubi only appears on the first reply of a run, the way a
                    // real chat thread groups consecutive messages from one person.
                    const startsRun = messages[index - 1]?.role !== "assistant";

                    return (
                      <div key={index} className="flex items-end gap-2">
                        {startsRun ? <HubiAvatar size={30} /> : <span className="w-[30px] shrink-0" />}
                        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm leading-relaxed text-[#231F20] shadow-sm">
                          <MessageText text={message.content} />
                        </div>
                      </div>
                    );
                  })}

                  {isSending && (
                    <div className="flex items-end gap-2">
                      <HubiAvatar size={30} mood="thinking" />
                      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-white px-4 py-4 shadow-sm">
                        {[0, 150, 300].map((delay) => (
                          <span
                            key={delay}
                            className="h-2 w-2 animate-bounce rounded-full bg-[#1A14A5]/40"
                            style={{ animationDelay: `${delay}ms` }}
                          />
                        ))}
                        <span className="sr-only">Typing…</span>
                      </div>
                    </div>
                  )}

                  {/* Once the visitor's details are in, the next best step is a
                      booked call, so offer it right there. */}
                  {leadCaptured && !isSending && messages.length > 0 && (
                    <div className="rounded-2xl border border-[#25D366]/30 bg-[#25D366]/5 p-3">
                      <p className="text-xs font-semibold text-[#128C4B]">You&apos;re on the team&apos;s list.</p>
                      <p className="mt-0.5 text-xs text-[#231F20]/65">Lock in a time now and skip the back-and-forth.</p>
                      <Link
                        href={BUSINESS_FACTS.paths.booking}
                        onClick={() => trackEvent("chatbot_booking_click", { page: pathname, source: "lead_card" })}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#1A14A5] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                      >
                        <CalendarCheck className="h-3.5 w-3.5" /> Book a free call
                      </Link>
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
                    placeholder="Ask about pricing, services, timelines…"
                    aria-label="Your message"
                    className="min-w-0 flex-1 rounded-2xl border border-[#1A14A5]/15 bg-[#F4F7FE] px-4 py-2.5 text-base text-[#231F20] sm:text-sm outline-none transition-colors placeholder:text-[#231F20]/40 focus:border-[#1A14A5]"
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
                  {ASSISTANT_NAME} is an automated guide, our team confirms every detail.
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {tourActive && <SiteTour onClose={closeTour} onPlanProject={planFromTour} />}
    </>
  );
}

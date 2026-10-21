"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Check, Loader2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const DISMISS_KEY = "bsh_exit_offer_dismissed_at";
const SUBMITTED_KEY = "bsh_exit_offer_submitted_at";
const SESSION_START_KEY = "bsh_session_started_at";
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // closed it — leave them alone for a week
const SUBMITTED_COOLDOWN_MS = 90 * 24 * 60 * 60 * 1000; // already gave an email — don't ask again
const SHOW_AFTER_MS = 2 * 60 * 1000; // show by the 2-minute mark on site at the latest
const ARM_DELAY_MS = 15_000; // exit intent ignored in the first 15s — avoids firing on an accidental top-of-page mouse pass
const BUSY_RETRY_MS = 15_000; // visitor is typing in a form — try again shortly instead of interrupting

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Pages where the visitor is already mid-conversion — a popup here would
// interrupt the exact thing they're already doing.
const SUPPRESSED_PATHS = ["/contact", "/book-consultation"];

type StorageKind = "localStorage" | "sessionStorage";

function readNumber(kind: StorageKind, key: string) {
  try {
    return Number(window[kind].getItem(key) ?? 0);
  } catch {
    return 0; // storage unavailable (private mode etc.)
  }
}

function writeNow(kind: StorageKind, key: string) {
  try {
    window[kind].setItem(key, String(Date.now()));
  } catch {
    // Ignore — worst case it can show again.
  }
}

function isVisitorBusy() {
  const el = document.activeElement;
  return (
    document.visibilityState !== "visible" ||
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement
  );
}

/**
 * Free-month email popup. Opens once per visit at most: on desktop
 * exit-intent (cursor leaving through the top of the viewport), or at the
 * latest after SHOW_AFTER_MS on the site. The timer is per browser session
 * and survives client-side navigation, so moving between pages doesn't
 * restart it. Kept low-friction: never on conversion pages, never while the
 * visitor is typing in a form, closes on Esc / backdrop click, and stays
 * away for a week after closing (or for good after submitting).
 */
export default function ExitIntentOffer() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const armedRef = useRef(false);
  const firedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const trigger = useCallback((reason: string) => {
    if (firedRef.current) return;
    firedRef.current = true;
    setVisible(true);
    trackEvent("exit_intent_shown", { reason });
  }, []);

  useEffect(() => {
    if (firedRef.current || SUPPRESSED_PATHS.includes(pathname ?? "")) return;

    const now = Date.now();
    if (now - readNumber("localStorage", DISMISS_KEY) < DISMISS_COOLDOWN_MS) return;
    if (now - readNumber("localStorage", SUBMITTED_KEY) < SUBMITTED_COOLDOWN_MS) return;

    let sessionStart = readNumber("sessionStorage", SESSION_START_KEY);
    if (!sessionStart) {
      writeNow("sessionStorage", SESSION_START_KEY);
      sessionStart = now;
    }

    let showTimer: ReturnType<typeof setTimeout>;
    const scheduleTimed = (delay: number) => {
      showTimer = setTimeout(() => {
        if (isVisitorBusy()) scheduleTimed(BUSY_RETRY_MS);
        else trigger("timer");
      }, delay);
    };
    scheduleTimed(Math.max(0, SHOW_AFTER_MS - (now - sessionStart)));

    const armTimer = setTimeout(() => {
      armedRef.current = true;
    }, ARM_DELAY_MS);

    const onMouseOut = (e: MouseEvent) => {
      if (!armedRef.current) return;
      // Cursor left through the top edge with nothing to relate to (i.e.
      // actually left the document, not just moved onto a child element).
      if (e.clientY <= 0 && !e.relatedTarget) trigger("exit_intent");
    };
    document.addEventListener("mouseout", onMouseOut);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(armTimer);
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, [pathname, trigger]);

  const close = useCallback(() => {
    setVisible(false);
    if (status !== "done") {
      writeNow("localStorage", DISMISS_KEY);
      trackEvent("exit_intent_dismiss");
    }
  }, [status]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visible, close]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setError("Please enter a valid email address.");
      setStatus("error");
      inputRef.current?.focus();
      return;
    }

    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "exit_popup",
          email: value,
          page_path: pathname,
          message: "Claimed the free month from the website popup.",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("done");
      writeNow("localStorage", SUBMITTED_KEY);
      trackEvent("exit_intent_convert");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="exit-offer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#231F20]/50 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          data-lenis-prevent
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-offer-title"
            className="relative w-full max-w-[510px] max-h-[calc(100vh-2rem)] overflow-y-auto rounded-[28px] border border-[#1A14A5]/10 bg-white px-6 py-10 sm:px-14 sm:py-12 text-center text-[#231F20] shadow-[0_30px_80px_-20px_rgba(26,20,165,0.45)]"
          >
            {/* Brand accent bar + soft glow, matching the site's light-blue theme */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#1A14A5] via-[#4F46E5] to-[#1A14A5]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#E8EDFF] to-transparent" />

            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full border border-[#1A14A5]/15 bg-white text-[#231F20]/60 hover:text-[#1A14A5] hover:bg-[#F4F7FE] transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {status === "done" ? (
              <div className="relative py-6">
                <div className="mx-auto w-14 h-14 rounded-full bg-[#1A14A5] flex items-center justify-center">
                  <Check className="w-7 h-7 text-white" />
                </div>
                <h2 id="exit-offer-title" className="mt-6 text-3xl font-extrabold text-[#1A14A5]">
                  You&apos;re in!
                </h2>
                <p className="mt-3 text-[#231F20]/70 leading-relaxed">
                  We&apos;ll email you within 24 hours to get your free month started.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-8 w-full rounded-full bg-[#1A14A5] py-3.5 font-semibold text-white hover:bg-[#231F20] transition-colors"
                >
                  Continue browsing
                </button>
              </div>
            ) : (
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#1A14A5]/15 bg-[#1A14A5]/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#1A14A5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1A14A5] animate-pulse" />
                  Wait, before you go
                </span>

                <h2 id="exit-offer-title" className="mt-6 text-[28px] sm:text-[34px] font-extrabold leading-tight text-[#231F20]">
                  Leaving with leads still
                  <br />
                  <span className="text-[#1A14A5]">slipping away?</span>
                </h2>

                <p className="mt-4 text-[15px] text-[#231F20]/70 leading-relaxed">
                  Grab your <strong className="font-semibold text-[#1A14A5]">free month</strong> before you go, we&apos;ll
                  build your entire growth system in 24 hours. $0 today, cancel anytime.
                </p>

                <form onSubmit={submit} noValidate className="mt-8 space-y-3">
                  <label htmlFor="exit-offer-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    ref={inputRef}
                    id="exit-offer-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    aria-invalid={status === "error"}
                    aria-describedby={status === "error" ? "exit-offer-error" : undefined}
                    className="w-full rounded-full border border-[#1A14A5]/15 bg-[#F4F7FE] px-6 py-3.5 text-center text-[#231F20] placeholder:text-[#231F20]/45 outline-none focus:border-[#1A14A5] focus:bg-white focus:ring-4 focus:ring-[#1A14A5]/10 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-[#1A14A5] py-3.5 font-semibold text-white shadow-[0_12px_30px_-10px_rgba(26,20,165,0.6)] hover:bg-[#231F20] disabled:opacity-70 transition-colors"
                  >
                    {status === "submitting" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Claim My Free Month <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  {status === "error" && (
                    <p id="exit-offer-error" role="alert" className="text-sm text-red-600">
                      {error}
                    </p>
                  )}
                </form>

                <p className="mt-5 text-xs text-[#231F20]/50">No contracts · No setup fees · Cancel anytime</p>

                <button
                  type="button"
                  onClick={close}
                  className="mt-5 text-sm text-[#231F20]/55 underline underline-offset-4 decoration-[#231F20]/25 hover:text-[#1A14A5] transition-colors"
                >
                  No thanks, maybe later
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

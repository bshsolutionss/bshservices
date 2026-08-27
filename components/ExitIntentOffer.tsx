"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, CalendarCheck } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const DISMISS_KEY = "bsh_exit_offer_dismissed_at";
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // don't re-nag for a week
const ARM_DELAY_MS = 10_000; // ignore intent signals in the first 10s — avoids firing on an accidental top-of-page mouse pass
const SCROLL_DEPTH_THRESHOLD = 0.6; // mobile has no mouseleave — 60% scrolled stands in for it

// Pages where the visitor is already mid-conversion — showing "book a free
// consultation" here would interrupt the exact thing they're already doing.
const SUPPRESSED_PATHS = ["/contact", "/book-consultation"];

/**
 * Soft slide-in (not a modal, nothing blocks the page) offering the free
 * consultation once — triggered by desktop exit-intent (mouse leaving
 * through the top of the viewport) or, on touch devices where that signal
 * doesn't exist, by scroll depth. Shows at most once per DISMISS_COOLDOWN_MS,
 * tracked in localStorage.
 */
export default function ExitIntentOffer() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const armedRef = useRef(false);
  const firedRef = useRef(false);

  const trigger = useCallback((reason: string) => {
    if (firedRef.current) return;
    firedRef.current = true;
    setVisible(true);
    trackEvent("exit_intent_shown", { reason });
  }, []);

  useEffect(() => {
    if (SUPPRESSED_PATHS.includes(pathname ?? "")) return;

    let lastDismissed = 0;
    try {
      lastDismissed = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
    } catch {
      // localStorage unavailable (private mode etc.) — treat as never dismissed.
    }
    if (Date.now() - lastDismissed < DISMISS_COOLDOWN_MS) return;

    const armTimer = setTimeout(() => {
      armedRef.current = true;
    }, ARM_DELAY_MS);

    const onMouseOut = (e: MouseEvent) => {
      if (!armedRef.current) return;
      // Standard exit-intent check: cursor left through the top edge with
      // nothing to relate to (i.e. actually left the document, not just
      // moved onto a child element).
      if (e.clientY <= 0 && !e.relatedTarget) trigger("exit_intent");
    };

    const onScroll = () => {
      if (!armedRef.current) return;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      if (window.scrollY / scrollable >= SCROLL_DEPTH_THRESHOLD) trigger("scroll_depth");
    };

    document.addEventListener("mouseout", onMouseOut);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(armTimer);
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname, trigger]);

  const dismiss = (converted: boolean) => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // Ignore — worst case it can show again this session.
    }
    trackEvent(converted ? "exit_intent_convert" : "exit_intent_dismiss");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40, x: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          // bottom-24 on desktop clears InstallAppButton's bottom-right pill
          // (SiteChrome renders both) — no overlap even if both show at once.
          className="fixed bottom-4 sm:bottom-24 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm bg-white rounded-3xl shadow-2xl border border-[#1A14A5]/10 p-5"
          role="dialog"
          aria-label="Free consultation offer"
        >
          <button
            type="button"
            onClick={() => dismiss(false)}
            aria-label="Dismiss"
            className="absolute top-3 right-3 p-1 text-[#231F20]/40 hover:text-[#231F20] rounded-full hover:bg-[#F4F7FE]"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-[#1A14A5]/10 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-[#1A14A5]" />
            </div>
            <div>
              <p className="font-bold text-[#231F20] leading-snug">Before you go — got a project in mind?</p>
              <p className="text-sm text-[#231F20]/70 mt-1">
                Grab a free 15-minute consultation. No pressure, no obligation.
              </p>
            </div>
          </div>

          <Link
            href="/book-consultation"
            onClick={() => dismiss(true)}
            className="mt-4 flex items-center justify-center w-full rounded-2xl bg-[#1A14A5] hover:bg-[#0e0a7a] text-white text-sm font-semibold py-3 transition-colors"
          >
            Book My Free Call
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

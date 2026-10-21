"use client";

import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import Mascot from "@/components/chatbot/Mascot";
import { TOUR_STEPS, type TourStep } from "@/lib/chatbot/guide";
import { BUSINESS_FACTS } from "@/lib/chatbot/config";

/**
 * The homepage walkthrough: dims the page, cuts a spotlight around one
 * section at a time and has Hubi explain it. Steps whose element isn't on
 * screen (e.g. the desktop nav on a phone) are dropped up front, so the
 * counter never lands on an empty step.
 *
 * Mounted only while the tour runs; the widget navigates to "/" first.
 */

const HEADER_OFFSET = 96;
const CARD_WIDTH = 340;
const CARD_GAP = 18;
/** Room above the card for Hubi, who always stands on top of it. */
const MASCOT_ROOM = 60;
const SPOTLIGHT_PAD = 10;

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function findTarget(step: TourStep): HTMLElement | null {
  for (const selector of step.selectors) {
    const element = document.querySelector<HTMLElement>(selector);
    if (element && element.getClientRects().length && element.offsetWidth > 0) return element;
  }
  return null;
}

function isFixed(element: HTMLElement): boolean {
  for (let node: HTMLElement | null = element; node; node = node.parentElement) {
    if (getComputedStyle(node).position === "fixed") return true;
  }
  return false;
}

interface SiteTourProps {
  onClose: (completed: boolean) => void;
  onPlanProject: () => void;
}

export default function SiteTour({ onClose, onPlanProject }: SiteTourProps) {
  const reduceMotion = useReducedMotion();
  const [steps, setSteps] = React.useState<TourStep[] | null>(null);
  const [index, setIndex] = React.useState(0);
  const [rect, setRect] = React.useState<Rect | null>(null);
  const [viewport, setViewport] = React.useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = React.useState(200);

  // Below-the-fold sections are dynamic imports, so give them a moment to
  // mount before deciding which steps exist.
  React.useEffect(() => {
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    const resolve = () => {
      const available = TOUR_STEPS.filter((step) => findTarget(step));
      if (available.length >= TOUR_STEPS.length - 1 || attempts++ > 15) {
        if (available.length) setSteps(available);
        else onClose(false);
        return;
      }
      timer = setTimeout(resolve, 200);
    };
    resolve();
    return () => clearTimeout(timer);
  }, [onClose]);

  const isLast = steps ? index === steps.length : false;
  const step = steps && !isLast ? steps[index] : null;

  // Bring the step's element into view.
  React.useEffect(() => {
    if (!step) return;
    const element = findTarget(step);
    if (!element || isFixed(element)) return;
    const top = element.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top: Math.max(top, 0), behavior: reduceMotion ? "auto" : "smooth" });
  }, [step, reduceMotion]);

  // Track the element every frame while the scroll settles; cheap, and it
  // follows lazy images and smooth scrolling without extra listeners.
  React.useEffect(() => {
    if (!step) {
      setRect(null);
      return;
    }
    let frame = 0;
    const measure = () => {
      const element = findTarget(step);
      setViewport((current) =>
        current.width === window.innerWidth && current.height === window.innerHeight
          ? current
          : { width: window.innerWidth, height: window.innerHeight }
      );
      if (element) {
        const box = element.getBoundingClientRect();
        setRect((current) =>
          current &&
          Math.abs(current.top - box.top) < 0.5 &&
          Math.abs(current.left - box.left) < 0.5 &&
          Math.abs(current.width - box.width) < 0.5 &&
          Math.abs(current.height - box.height) < 0.5
            ? current
            : { top: box.top, left: box.left, width: box.width, height: box.height }
        );
      }
      frame = requestAnimationFrame(measure);
    };
    measure();
    return () => cancelAnimationFrame(frame);
  }, [step]);

  React.useLayoutEffect(() => {
    if (cardRef.current) setCardHeight(cardRef.current.offsetHeight);
  }, [index, steps, viewport.width]);

  const next = React.useCallback(() => {
    if (!steps) return;
    setIndex((current) => Math.min(current + 1, steps.length));
  }, [steps]);
  const back = React.useCallback(() => setIndex((current) => Math.max(current - 1, 0)), []);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose(isLast);
      else if (event.key === "ArrowRight" && !isLast) next();
      else if (event.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [back, next, onClose, isLast]);

  if (!steps) return null;

  const total = steps.length;
  const cardWidth = Math.min(CARD_WIDTH, viewport.width - 32);

  // Spotlight: the element's box, clipped to the viewport so a section taller
  // than the screen still reads as "this".
  const spot =
    rect && step
      ? (() => {
          const top = Math.max(rect.top - SPOTLIGHT_PAD, 8);
          const bottom = Math.min(rect.top + rect.height + SPOTLIGHT_PAD, viewport.height - 8);
          const left = Math.max(rect.left - SPOTLIGHT_PAD, 8);
          const right = Math.min(rect.left + rect.width + SPOTLIGHT_PAD, viewport.width - 8);
          return { top, left, width: Math.max(right - left, 0), height: Math.max(bottom - top, 0) };
        })()
      : null;

  // Card placement: below the spotlight, else above it, else docked to the
  // bottom of the screen over the (tall) section itself.
  let cardTop = viewport.height / 2 - cardHeight / 2;
  let cardLeft = viewport.width / 2 - cardWidth / 2;
  let pointsAtSpot = false;
  if (spot) {
    const spaceBelow = viewport.height - (spot.top + spot.height);
    const center = spot.left + spot.width / 2;
    cardLeft = Math.min(Math.max(center - cardWidth / 2, 16), viewport.width - cardWidth - 16);
    if (spaceBelow >= cardHeight + CARD_GAP + MASCOT_ROOM + 16) {
      cardTop = spot.top + spot.height + CARD_GAP + MASCOT_ROOM;
      pointsAtSpot = true;
    } else if (spot.top >= cardHeight + CARD_GAP + MASCOT_ROOM + 16) {
      cardTop = spot.top - cardHeight - CARD_GAP;
    } else {
      cardTop = viewport.height - cardHeight - 24;
      cardLeft = viewport.width / 2 - cardWidth / 2;
    }
  }

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Site tour">
      {/* Dim layer with the spotlight hole. Clicks on the dim area end the
          tour, the same as Skip. */}
      <button
        aria-label="End the tour"
        onClick={() => onClose(isLast)}
        className="absolute inset-0 h-full w-full cursor-default"
        style={{ background: spot ? "transparent" : "rgba(15, 13, 40, 0.55)" }}
      />
      {spot && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-2xl ring-2 ring-white/70"
          initial={false}
          animate={spot}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 32 }}
          style={{ boxShadow: "0 0 0 9999px rgba(15, 13, 40, 0.55)" }}
        />
      )}

      <motion.div
        ref={cardRef}
        initial={false}
        animate={{ top: cardTop, left: cardLeft }}
        transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 240, damping: 30 }}
        className="absolute"
        style={{ width: cardWidth }}
      >
        {/* Hubi stands on top of the card, pointing up at the section when
            the card sits below it. */}
        {!isLast && (
          <div className="absolute -top-[62px] left-1/2 -translate-x-1/2">
            <Mascot size={54} mood={pointsAtSpot ? "point" : "wave"} />
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
            className="relative rounded-3xl border border-[#1A14A5]/10 bg-white p-5 shadow-2xl"
          >
            {step ? (
              <>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1A14A5]/70">
                  Tour · {index + 1}/{total}
                </p>
                <h3 className="mt-1.5 text-lg font-bold leading-snug text-[#231F20]">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#231F20]/70">{step.body}</p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    {steps.map((_, dot) => (
                      <span
                        key={dot}
                        className={`h-1.5 rounded-full transition-all ${
                          dot === index ? "w-5 bg-[#1A14A5]" : "w-1.5 bg-[#1A14A5]/20"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    {index > 0 && (
                      <button
                        onClick={back}
                        aria-label="Previous step"
                        className="rounded-full p-2 text-[#231F20]/60 transition-colors hover:bg-[#F4F7FE] hover:text-[#1A14A5]"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onClose(false)}
                      className="rounded-full px-3 py-2 text-sm font-medium text-[#231F20]/60 transition-colors hover:text-[#1A14A5]"
                    >
                      Skip
                    </button>
                    <button
                      onClick={next}
                      autoFocus
                      className="flex items-center gap-1.5 rounded-full bg-[#1A14A5] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      Next <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="mx-auto -mt-1 flex justify-center">
                  <Mascot size={64} mood="happy" />
                </div>
                <h3 className="mt-2 text-lg font-bold text-[#231F20]">That&apos;s the tour!</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#231F20]/70">
                  Ready to see what your project would cost? Three taps and I&apos;ll recommend a package.
                </p>
                <div className="mt-4 grid gap-2">
                  <button
                    onClick={onPlanProject}
                    autoFocus
                    className="flex items-center justify-center gap-2 rounded-2xl bg-[#1A14A5] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    <Sparkles className="h-4 w-4" /> Get my instant estimate
                  </button>
                  <Link
                    href={BUSINESS_FACTS.paths.booking}
                    onClick={() => onClose(true)}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-[#1A14A5]/20 px-4 py-3 text-sm font-semibold text-[#1A14A5] transition-colors hover:bg-[#F4F7FE]"
                  >
                    <CalendarCheck className="h-4 w-4" /> Book a free consultation
                  </Link>
                  <button
                    onClick={back}
                    className="mt-1 text-xs font-medium text-[#231F20]/50 hover:text-[#1A14A5]"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

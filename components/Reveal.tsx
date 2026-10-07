"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger in ms. */
  delay?: number;
  as?: "div" | "li" | "section";
}

/**
 * Lightweight scroll-reveal: one IntersectionObserver per element and a CSS
 * transition — no animation library. Content is fully visible without JS and
 * for users who prefer reduced motion (the hidden state is only applied once
 * the client has mounted and confirmed motion is OK).
 */
export default function Reveal({ children, className = "", delay = 0, as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<"ssr" | "hidden" | "shown">("ssr");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      setState("shown");
      return;
    }
    // Already on screen at mount → don't flash it hidden first.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      setState("shown");
      return;
    }
    setState("hidden");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("shown");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      style={{ transitionDelay: state === "shown" ? `${delay}ms` : undefined }}
      className={`${className} ${
        state === "hidden" ? "translate-y-6 opacity-0" : "translate-y-0 opacity-100"
      } transition-[opacity,transform] duration-700 ease-out will-change-[opacity,transform]`}
    >
      {children}
    </Tag>
  );
}

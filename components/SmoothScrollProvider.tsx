"use client";

import { useEffect } from "react";

/**
 * Lenis smooth-scroll — wheel-only. It adds nothing on touch devices (native
 * momentum scrolling is already smooth), and it should never override a
 * reduced-motion preference, so on those it isn't even downloaded. The
 * library is imported lazily to keep it out of the initial bundle.
 */
export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const skip =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches;
    if (skip) return;

    let rafId = 0;
    let destroyed = false;
    let destroy: (() => void) | undefined;

    import("@studio-freight/lenis").then(({ default: Lenis }) => {
      if (destroyed) return;
      const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
      const raf = (time: number) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
      destroy = () => lenis.destroy();
    });

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      destroy?.();
    };
  }, []);

  return <>{children}</>;
}

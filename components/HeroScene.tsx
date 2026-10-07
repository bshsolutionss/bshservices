"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// three.js is heavy: code-split, client-only, and mounted after the page is
// idle so the hero text paints first.
const HeroScene3D = dynamic(() => import("./HeroScene3D"), { ssr: false });

type NetworkInfo = { saveData?: boolean; effectiveType?: string };

function canAfford3D(): boolean {
  // Reduced motion still gets the scene (as a still frame); weak networks don't.
  const conn = (navigator as Navigator & { connection?: NetworkInfo }).connection;
  if (conn?.saveData) return false;
  if (conn?.effectiveType && /(^|-)2g$/.test(conn.effectiveType)) return false;
  return true;
}

/**
 * Hero backdrop: a soft CSS glow + grid always render (no JS, no WebGL), and
 * the interactive 3D scene fades in on top once the browser is idle. The 3D
 * core centres itself on the `[data-hero-stage]` slot in the hero's right
 * column (see heros.tsx).
 */
export default function HeroScene() {
  const [mount, setMount] = useState(false);

  useEffect(() => {
    if (!canAfford3D()) return;
    let timeout = 0;
    const go = () => {
      timeout = window.setTimeout(() => setMount(true), 400);
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => {
      window.removeEventListener("load", go);
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0" aria-hidden="true">
      {/* CSS-only layer: grid + glows (also the fallback when 3D is skipped) */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(26,20,165,.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,20,165,.06) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 80% 70% at 70% 50%, #000 20%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 70% 50%, #000 20%, transparent 78%)",
        }}
      />
      <div className="absolute right-[-10%] top-[8%] h-[70%] w-[55%] rounded-full bg-[#4b35ff]/15 blur-[110px]" />
      <div className="absolute bottom-[-10%] left-[-5%] h-[45%] w-[40%] rounded-full bg-[#00a8ff]/10 blur-[110px]" />

      {mount && (
        <div className="absolute inset-0 animate-in fade-in duration-1000">
          <HeroScene3D />
        </div>
      )}
    </div>
  );
}

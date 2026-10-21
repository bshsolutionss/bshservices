"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

/**
 * Mounts Microsoft Clarity (session replay + heatmaps) once, client-side.
 * No-ops entirely until NEXT_PUBLIC_CLARITY_PROJECT_ID is set — get the
 * project ID from clarity.microsoft.com (Settings → Setup → Install
 * tracking code → "Project ID"), then add it to Vercel's env vars (and
 * .env.local for local dev). Nothing else in the codebase needs to change.
 */
export default function ClarityInit() {
  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
    if (!projectId) return;

    // Session replay isn't needed for first paint — start it once the page is
    // idle so it never competes with hydration.
    const start = () => Clarity.init(projectId);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = window.setTimeout(start, 2000);
    return () => window.clearTimeout(t);
  }, []);

  return null;
}

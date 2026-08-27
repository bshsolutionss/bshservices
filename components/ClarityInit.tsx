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
    Clarity.init(projectId);
  }, []);

  return null;
}

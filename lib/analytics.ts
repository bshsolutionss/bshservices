"use client";

import { track as vercelTrack } from "@vercel/analytics";
import Clarity from "@microsoft/clarity";

/**
 * One call-site for every funnel event this app fires — form-step
 * progression, booking-step progression, WhatsApp clicks, quiz/lead-magnet
 * completions, exit-intent shows/converts. Fans out to whichever analytics
 * tools are actually wired up:
 *
 *  - Vercel Analytics (`@vercel/analytics`) — already installed, already
 *    inside the CSP, shows up in the existing Vercel dashboard immediately.
 *  - Microsoft Clarity (`@microsoft/clarity`) — session replay/heatmaps;
 *    `Clarity.event()` tags the session so a drop-off can be watched back.
 *
 * No GA4 / Meta Pixel calls here — those need real Measurement/Pixel IDs
 * this codebase doesn't have. Add them the same way if/when those IDs
 * exist (see components/ClarityInit.tsx for the "no-op until configured"
 * pattern to follow).
 *
 * Never throws — analytics failing must never break the funnel it's
 * trying to measure.
 */
export function trackEvent(name: string, properties?: Record<string, string | number | boolean>): void {
  if (typeof window === "undefined") return;

  try {
    vercelTrack(name, properties);
  } catch {
    // Vercel Analytics not active in this environment (e.g. local dev) — ignore.
  }

  try {
    Clarity.event(name);
  } catch {
    // Clarity not initialized (no project ID configured yet) — ignore.
  }
}

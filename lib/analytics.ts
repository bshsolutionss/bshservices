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
 *  - Google Analytics 4 (`window.gtag`, loaded by components/GoogleAnalytics.tsx)
 *    — the event shows up under Reports → Engagement → Events.
 *
 * No Meta Pixel calls here — that needs a Pixel ID this codebase doesn't
 * have. Add it the same way if/when that ID exists (see
 * components/ClarityInit.tsx for the "no-op until configured" pattern).
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

  try {
    // GA4 event names must be snake_case and ≤40 chars; all names here already are.
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    gtag?.("event", name, properties);
  } catch {
    // GA not loaded (no measurement ID configured yet) — ignore.
  }
}

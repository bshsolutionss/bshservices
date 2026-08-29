/**
 * Rule-based lead scoring — sets `priority` and a starting `expected_value`
 * at insert time so hot leads surface at the top of the admin queue instead
 * of everyone landing on "medium" and needing a human to triage first.
 *
 * Deliberately simple and transparent (a handful of additive point rules,
 * no ML) so anyone reading the admin panel can tell *why* a lead scored the
 * way it did. `expected_value` is a rough starting estimate from
 * lib/pricing-data.ts's GLOBAL tiers — a nudge for the sales conversation,
 * not a quote; the admin can always edit it on the lead/deal record.
 */
import type { LeadPriority, LeadSource } from "@/lib/leads";
import type { Currency } from "@/lib/invoices";

export interface ScoreLeadInput {
  source: LeadSource;
  service_category?: string | null;
  selected_service?: string | null;
  business_type?: string | null;
  message?: string | null;
  phone?: string | null;
}

export interface LeadScore {
  priority: LeadPriority;
  expectedValue: number | null;
  /** Always USD — VALUE_SIGNALS below are anchored to lib/pricing-data.ts's GLOBAL (USD) tiers. The admin can switch a specific lead to PKR manually if it's actually a local-currency deal. */
  expectedValueCurrency: Currency;
}

/**
 * Category → rough one-time-equivalent USD value, from lib/pricing-data.ts's
 * GLOBAL tiers (mid-tier price as the anchor). Matched against
 * service_category/selected_service via substring, case-insensitive — the
 * two forms that collect this (Form.tsx, and a query-string prefill on the
 * contact form) use free-text category labels, not a fixed enum.
 */
const VALUE_SIGNALS: { pattern: RegExp; points: number; value: number }[] = [
  // Custom / high-ticket build work — Custom Code tiers ($699–$1,499).
  { pattern: /custom software|web application|custom code|saas|enterprise/i, points: 30, value: 1100 },
  { pattern: /e-?commerce/i, points: 28, value: 650 },
  { pattern: /mobile app/i, points: 28, value: 900 },
  // Recurring retainer potential (marketing/SEO/social/ads/email) — Standard
  // retainer tier ($999/mo) is worth more long-run than a one-off site.
  { pattern: /seo|ppc|social media|marketing|advertising|content marketing/i, points: 22, value: 999 },
  { pattern: /\bai\b|automation|chatbot/i, points: 20, value: 700 },
  { pattern: /website development|wordpress|web design/i, points: 15, value: 550 },
  { pattern: /ui\/?ux|branding|logo|graphic|packaging|motion graphic/i, points: 10, value: 400 },
  { pattern: /photography|video|drone|event coverage/i, points: 8, value: 350 },
];

const SOURCE_POINTS: Record<LeadSource, number> = {
  consultation_booking: 40, // picked an actual time slot — highest intent
  service_form: 25, // came from a specific service page, already knows what they want
  contact_form: 15, // general inquiry, less qualified yet
  lead_magnet: 5, // downloaded something free — early-funnel, not yet a real inquiry
};

const BUSINESS_TYPE_POINTS: Record<string, number> = {
  "Agency / Company": 10,
  "E-commerce": 10,
  "Personal Brand": 5,
  Others: 0,
};

export function scoreLead(input: ScoreLeadInput): LeadScore {
  let points = SOURCE_POINTS[input.source] ?? 10;
  let expectedValue: number | null = null;

  const haystack = `${input.service_category ?? ""} ${input.selected_service ?? ""}`;
  for (const signal of VALUE_SIGNALS) {
    if (signal.pattern.test(haystack)) {
      points += signal.points;
      // First (highest-specificity) match wins — patterns are ordered most-
      // to-least valuable above, so this naturally picks the pricier signal
      // when a lead's text matches more than one category.
      if (expectedValue === null) expectedValue = signal.value;
      break;
    }
  }

  if (input.business_type && input.business_type in BUSINESS_TYPE_POINTS) {
    points += BUSINESS_TYPE_POINTS[input.business_type];
  }

  // A real, non-trivial message is an engagement signal — someone who typed
  // more than a couple of words is more invested than a one-line submission.
  if (input.message && input.message.trim().length > 40) points += 5;

  // Leaving a phone number signals they're open to being called, not just emailed.
  if (input.phone && input.phone.trim().length > 0) points += 5;

  const priority: LeadPriority = points >= 70 ? "urgent" : points >= 45 ? "high" : points >= 25 ? "medium" : "low";

  return { priority, expectedValue, expectedValueCurrency: "USD" };
}

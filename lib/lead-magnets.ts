/**
 * Registry of gated PDF downloads (see lib/pdf/LeadMagnetDocument.tsx and
 * app/api/lead-magnet/route.ts). Each entry is self-contained — a service
 * page opts in by setting `leadMagnetSlug` on its ServiceDefinition in
 * lib/services-data.ts, the rest wires up automatically.
 *
 * To add another one: add an entry here, then set `leadMagnetSlug` on the
 * relevant service(s) in lib/services-data.ts. No new component/route needed.
 */
export interface LeadMagnet {
  slug: string;
  /** Shown on the gate card. */
  title: string;
  description: string;
  /** PDF cover title/subtitle — can differ slightly from the gate copy above. */
  pdfTitle: string;
  pdfSubtitle: string;
  items: string[];
}

export const LEAD_MAGNETS: Record<string, LeadMagnet> = {
  "seo-audit-checklist": {
    slug: "seo-audit-checklist",
    title: "Free SEO Audit Checklist",
    description: "The exact 20-point checklist we run through before starting any SEO engagement — yours free.",
    pdfTitle: "SEO Audit Checklist",
    pdfSubtitle: "20 checks to run before (and while) you invest in SEO",
    items: [
      "Site is indexed — search “site:yourdomain.com” and confirm real pages show up",
      "robots.txt isn't accidentally blocking pages you want indexed",
      "An XML sitemap exists and is submitted in Google Search Console",
      "Every page has a unique, descriptive title tag under ~60 characters",
      "Every page has a unique meta description under ~155 characters",
      "One clear H1 per page, matching what the page is actually about",
      "Core Web Vitals (LCP, CLS, INP) are in the “good” range in PageSpeed Insights",
      "Site is fully mobile-responsive — no horizontal scrolling, tap targets big enough",
      "HTTPS is enforced site-wide with no mixed-content warnings",
      "Images use compressed formats and descriptive alt text",
      "URLs are short, readable, and free of tracking-parameter clutter",
      "Internal links connect related pages — no orphaned pages with zero inlinks",
      "Canonical tags are set correctly, especially on near-duplicate pages",
      "Structured data (schema.org) is present where relevant — reviews, FAQs, products",
      "404 pages are handled gracefully, and broken internal links are fixed",
      "Redirects use 301 (permanent), not 302, when a page has moved for good",
      "Primary keywords are mapped one-to-one to the pages meant to rank for them",
      "Competitors ranking above you have been reviewed for what they're doing differently",
      "Google Business Profile is claimed and complete, if the business serves a local area",
      "Analytics + Search Console are both installed and actually being checked monthly",
    ],
  },
};

export function getLeadMagnet(slug: string): LeadMagnet | undefined {
  return LEAD_MAGNETS[slug];
}

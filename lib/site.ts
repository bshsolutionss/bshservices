/**
 * Canonical site origin — the single source of truth for every absolute
 * URL this app emits (OpenGraph/Twitter meta, JSON-LD, sitemap.xml,
 * robots.txt, transactional emails).
 *
 * Override via NEXT_PUBLIC_SITE_URL if the canonical domain ever changes
 * again — nothing else in the codebase should hardcode it. No trailing
 * slash (matches new URL(...).origin's shape, and keeps `${SITE_URL}/path`
 * concatenation simple).
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bshsolutions.net";

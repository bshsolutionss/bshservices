/**
 * Canonical production origin. It is intentionally fixed so a deployment
 * variable cannot make canonical URLs, feeds, or structured data drift to a
 * preview or legacy hostname. Keep it without a trailing slash.
 */
export const SITE_URL = "https://bshsolutions.net";

export const DEFAULT_OG_IMAGE = {
  url: "/images/Banner.png",
  width: 1915,
  height: 709,
  alt: "BSH Solutions digital, software, marketing, AI, and media services",
} as const;

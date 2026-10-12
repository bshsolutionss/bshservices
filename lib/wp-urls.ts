import { SITE_URL } from "@/lib/site";

/** The headless WordPress origin (noindexed; never shown to visitors or crawlers). */
export const CMS_URL = process.env.WORDPRESS_URL || "https://darkgrey-pelican-916395.hostingersite.com";

const CMS_HOST = (() => {
  try {
    return new URL(CMS_URL).hostname.toLowerCase();
  } catch {
    return "";
  }
})();

export function isCmsHost(hostname: string): boolean {
  return Boolean(CMS_HOST) && hostname.toLowerCase() === CMS_HOST;
}

/**
 * Maps a URL on the WordPress origin to its public bshsolutions.net
 * equivalent:
 *   - non-WordPress URLs, and WordPress's own `wp-*` paths (media in
 *     /wp-content, REST in /wp-json, …) → returned unchanged
 *   - WordPress root                      → site root (hash preserved)
 *   - `/{slug}/` (a post permalink)       → `/blog/{slug}`
 *   - anything deeper (category, tag, author, pagination) → `null`,
 *     meaning "no public equivalent" — the frontend has no such pages, so
 *     callers must drop or redirect the reference rather than invent a URL.
 */
export function toPublicUrl(href: string): string | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return href;
  }
  if (!isCmsHost(url.hostname)) return href;

  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return url.search || url.hash ? `${SITE_URL}/${url.search}${url.hash}` : SITE_URL;
  }
  if (segments[0].startsWith("wp-")) return href;
  if (segments.length === 1) return `${SITE_URL}/blog/${segments[0]}${url.search}${url.hash}`;
  return null;
}

/**
 * Zero-dependency, serverless-safe HTML sanitizer for WordPress content.
 * Replaces isomorphic-dompurify/jsdom to completely prevent Node.js ERR_REQUIRE_ESM
 * crashes inside Vercel Serverless Functions.
 */

import { SITE_URL } from "@/lib/site";

// Dangerous tags that should be completely stripped including their inner content
const DANGEROUS_TAGS_WITH_CONTENT =
  /<(script|style|object|embed|applet|meta|base|form|input|textarea|button)[^>]*>[\s\S]*?<\/\1>/gi;

const DANGEROUS_SELF_CLOSING_TAGS =
  /<(script|style|object|embed|applet|meta|base|form|input|textarea|button)[^>]*\/?>/gi;

// Unsafe attributes (event handlers like onclick, onload, onerror, etc.)
const EVENT_HANDLER_ATTRS = /\s*on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;

// Unsafe URL schemes (javascript:, data:text/html, etc.)
const JAVASCRIPT_URLS =
  /\s*(href|src|action)\s*=\s*["']?\s*(javascript:|data:text\/html)[^"'>\s]*/gi;

export function sanitizeWpHtml(html: string): string {
  if (!html || typeof html !== "string") return "";

  let clean = html;

  // The frontend owns all public URLs. Keep CMS-authored anchor text and
  // content, but remove redirect hops through the retired domain and prevent
  // visitors from being sent to duplicate WordPress-rendered article pages.
  clean = clean.replace(/href=(['"])(https?:\/\/[^'"\s>]+)\1/gi, (_match, quote, href) => {
    return `href=${quote}${normalizeCmsHref(href)}${quote}`;
  });

  // The page template supplies the one primary H1 from the CMS post title.
  // Any H1 pasted into the CMS body becomes an H2 so the hierarchy remains
  // valid without deleting or rewriting the editor's wording.
  clean = clean.replace(/<h1(\s[^>]*)?>/gi, "<h2$1>").replace(/<\/h1>/gi, "</h2>");

  // 1. Remove dangerous blocks (scripts, forms, objects, etc.)
  clean = clean.replace(DANGEROUS_TAGS_WITH_CONTENT, "");
  clean = clean.replace(DANGEROUS_SELF_CLOSING_TAGS, "");

  // 2. Remove all inline event handlers (onerror, onload, onclick, onmouseover, etc.)
  clean = clean.replace(EVENT_HANDLER_ATTRS, "");

  // 3. Remove javascript: and malicious data URIs in href/src
  clean = clean.replace(JAVASCRIPT_URLS, "");

  // 4. Sanitize iframes: only allow safe embeds (YouTube, Vimeo, SoundCloud, Spotify)
  clean = clean.replace(/<iframe([^>]*)>/gi, (_match, attrs) => {
    const srcMatch = attrs.match(/src\s*=\s*["']([^"']+)["']/i);
    const src = srcMatch ? srcMatch[1] : "";
    const isSafeSrc =
      /^(https:\/\/)?(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be|player\.vimeo\.com|spotify\.com|w\.soundcloud\.com)/i.test(
        src
      );

    if (!isSafeSrc) {
      return "";
    }
    return `<iframe${attrs} loading="lazy" sandbox="allow-scripts allow-same-origin allow-presentation">`;
  });

  return clean;
}

function normalizeCmsHref(href: string): string {
  try {
    const url = new URL(href);
    const hostname = url.hostname.toLowerCase();

    if (
      hostname === "bshsolutionss.com" ||
      hostname === "www.bshsolutionss.com" ||
      hostname === "www.bshsolutions.net"
    ) {
      return `${SITE_URL}${url.pathname}${url.search}${url.hash}`;
    }

    if (hostname === "darkgrey-pelican-916395.hostingersite.com") {
      const path = url.pathname.replace(/^\/+|\/+$/g, "");
      if (!path) return `${SITE_URL}/${url.search}${url.hash}`;
      if (!path.startsWith("wp-")) {
        return `${SITE_URL}/blog/${path}${url.search}${url.hash}`;
      }
    }
  } catch {
    return href;
  }

  return href;
}

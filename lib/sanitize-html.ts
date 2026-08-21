/**
 * Zero-dependency, serverless-safe HTML sanitizer for WordPress content.
 * Replaces isomorphic-dompurify/jsdom to completely prevent Node.js ERR_REQUIRE_ESM
 * crashes inside Vercel Serverless Functions.
 */

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

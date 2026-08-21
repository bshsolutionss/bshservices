import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes HTML pulled from the headless WordPress API before it's ever
 * passed to `dangerouslySetInnerHTML`. WordPress content is treated as
 * untrusted input here on purpose — it comes from a third-party CMS over
 * the network (see lib/wp.ts), and a compromised WP install, a malicious
 * plugin, or a careless post author pasting raw HTML are all realistic ways
 * a `<script>` tag could end up in `post.content.rendered`. Without this,
 * that would be a stored XSS straight into every visitor's browser.
 *
 * Runs both server- and client-side (isomorphic-dompurify wraps jsdom on
 * the server), so it's safe to call from a Server Component.
 */
export function sanitizeWpHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    // WordPress post bodies legitimately use these — images, links,
    // headings, tables, iframes for embeds (YouTube etc.), and formatting.
    // Anything not listed (script, on*="" handlers, style tags/attrs with
    // expressions, etc.) is stripped, not escaped.
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "target", "rel"],
  });
}

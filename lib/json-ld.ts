/**
 * Safely serializes a JSON-LD object for use inside a
 * `<script type="application/ld+json">` tag via `dangerouslySetInnerHTML`.
 *
 * `JSON.stringify` alone does not escape `<`, so if any value in the object
 * (e.g. a WordPress post title, which we still defensively cover here even
 * though it's regex-stripped before reaching this call) ever contains a
 * literal `</script>`, the browser's HTML parser closes the script tag
 * early and treats whatever follows as new markup — a classic script-tag
 * breakout. Escaping `<` to its unicode escape neutralizes that without
 * changing the JSON's meaning (JSON parsers don't care about the escape).
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

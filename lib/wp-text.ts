// WordPress's REST API returns `title.rendered` / `excerpt.rendered` as
// HTML — tags plus HTML entities (`&amp;`, `&#8217;`, `&hellip;`, WP's
// "[&hellip;]" excerpt truncation marker, etc.), since it's meant to be
// dropped into a page via innerHTML. That's fine anywhere we render it with
// `dangerouslySetInnerHTML` (the browser decodes entities as part of
// parsing HTML) — but anywhere it's used as a *plain string* instead —
// <title>, <meta name="description">, an `alt` attribute, JSON-LD text
// fields — entities are never decoded by the browser, so they show up
// literally (e.g. a search snippet reading "...where it [&hellip;]"
// instead of "...where it […]"). This strips tags AND decodes entities so
// every plain-text use of WP content is actually plain text.
const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  copy: "©",
  reg: "®",
  trade: "™",
};

export function wpToPlainText(html: string | null | undefined): string {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&#x([0-9a-fA-F]+);/g, (_match, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_match, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-zA-Z]+);/g, (match, name) => NAMED_ENTITIES[name.toLowerCase()] ?? match)
    .replace(/\[(?:\s*…\s*|\s*\.\.\.\s*)\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateAtWord(text: string, maxLength: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;

  const shortened = clean.slice(0, maxLength + 1);
  const lastSpace = shortened.lastIndexOf(" ");
  return shortened.slice(0, lastSpace > maxLength * 0.6 ? lastSpace : maxLength).trim();
}

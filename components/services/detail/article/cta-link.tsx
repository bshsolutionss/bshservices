import { SITE_URL } from "@/lib/site";

// Must stay byte-for-byte identical to the URL embedded in the content/*.md
// and lib/services-articles.ts CTA sentences below (both were migrated to
// SITE_URL's domain together) — splitCtaSentence's `.includes(CTA_URL)`
// check depends on an exact match.
export const CTA_URL = `${SITE_URL}/book-consultation`;

/**
 * The source content's CTA sentences all follow one pattern: a question,
 * then "Book a/your [free] consultation [today] at <url>" — e.g. "Ready to
 * build a brand people actually remember? Book a free consultation at
 * https://bshsolutions.net/book-consultation". Splitting on the question
 * mark keeps the genuine question as visible text and drops the trailing
 * "Book ... at <url>" instruction, which a real button says better than a
 * raw printed URL ever could.
 */
export function splitCtaSentence(text: string): string {
  if (!text.includes(CTA_URL)) return text;
  const qIndex = text.indexOf("?");
  if (qIndex !== -1) return text.slice(0, qIndex + 1);
  // No "?" in this particular sentence — still never show the bare URL.
  return text.slice(0, text.indexOf(CTA_URL)).trim();
}

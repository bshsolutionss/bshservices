import { SITE_URL } from "@/lib/site";
import { CMS_URL, isCmsHost, toPublicUrl } from "@/lib/wp-urls";
import { wpToPlainText } from "@/lib/wp-text";

/**
 * Rank Math SEO → Next.js, via Rank Math's official Headless CMS endpoint
 * (`/wp-json/rankmath/v1/getHead?url=<wordpress permalink>`). Server-side
 * only: it returns the post's SEO <head> markup, which we PARSE into typed
 * fields — the markup itself is never injected into pages.
 *
 * Robots are deliberately NOT read. The WordPress origin is noindexed on
 * purpose, and in a REST context Rank Math reports `noindex, nofollow` for
 * every post (the same post's real HTML page says `index, follow`).
 * Honouring it would de-index the whole public blog, so indexability is
 * decided by the frontend alone.
 */

const REVALIDATE_SECONDS = 300;

const REQUEST_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 BSHSolutions/1.0",
  Accept: "application/json",
};

export type JsonNode = Record<string, unknown>;

export interface RankMathImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

export interface RankMathSeo {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: RankMathImage;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  /** Raw JSON-LD graph nodes exactly as Rank Math emitted them (CMS URLs and all). */
  schema: JsonNode[];
}

export async function getRankMathSeo(permalink: string | undefined): Promise<RankMathSeo | null> {
  try {
    if (!permalink) return null;
    const cms = new URL(CMS_URL);
    const target = new URL(permalink);
    if (!isCmsHost(target.hostname)) return null;

    const endpoint = new URL("/wp-json/rankmath/v1/getHead", cms.origin);
    endpoint.searchParams.set("url", target.toString());

    const res = await fetch(endpoint, {
      headers: REQUEST_HEADERS,
      next: { revalidate: REVALIDATE_SECONDS, tags: ["rankmath-head"] },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const body: unknown = await res.json();
    const head = (body as { success?: boolean; head?: unknown } | null)?.head;
    if (typeof head !== "string" || !head) return null;
    return parseRankMathHead(head);
  } catch {
    // Network error, timeout, bad JSON, Rank Math inactive — callers fall back
    // to the post's own title/excerpt. SEO enrichment must never break a page.
    return null;
  }
}

export function parseRankMathHead(head: string): RankMathSeo {
  const metas = parseMetaTags(head);
  const meta = (key: string) => wpToPlainText(metas.get(key)) || undefined;

  const ogImageUrl = meta("og:image");
  const ogImage: RankMathImage | undefined = ogImageUrl
    ? {
        url: ogImageUrl,
        width: toPositiveInt(meta("og:image:width")),
        height: toPositiveInt(meta("og:image:height")),
        alt: meta("og:image:alt"),
      }
    : undefined;

  return {
    title: wpToPlainText(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]) || undefined,
    description: meta("description"),
    ogTitle: meta("og:title"),
    ogDescription: meta("og:description"),
    ogImage,
    twitterTitle: meta("twitter:title"),
    twitterDescription: meta("twitter:description"),
    twitterImage: meta("twitter:image"),
    schema: parseJsonLd(head),
  };
}

/** name/property → content for every <meta> tag, regardless of attribute order. */
function parseMetaTags(head: string): Map<string, string> {
  const result = new Map<string, string>();
  for (const [tag] of head.matchAll(/<meta\s[^>]*>/gi)) {
    const attrs = new Map<string, string>();
    for (const [, name, , dq, sq] of tag.matchAll(/([a-zA-Z:_-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
      attrs.set(name.toLowerCase(), dq ?? sq ?? "");
    }
    const key = attrs.get("property") ?? attrs.get("name");
    const content = attrs.get("content");
    if (key && content !== undefined && !result.has(key.toLowerCase())) {
      result.set(key.toLowerCase(), content);
    }
  }
  return result;
}

function parseJsonLd(head: string): JsonNode[] {
  const nodes: JsonNode[] = [];
  for (const [, json] of head.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      const data: unknown = JSON.parse(json);
      const graph = (data as { "@graph"?: unknown } | null)?.["@graph"];
      const items = Array.isArray(graph) ? graph : [data];
      for (const item of items) {
        if (item && typeof item === "object" && !Array.isArray(item)) nodes.push(item as JsonNode);
      }
    } catch {
      // One malformed block shouldn't discard the rest.
    }
  }
  return nodes;
}

function toPositiveInt(value: string | undefined): number | undefined {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

// ---------------------------------------------------------------------------
// Structured data
// ---------------------------------------------------------------------------

// Node types worth taking from Rank Math. Everything else is dropped on
// purpose: Organization/WebSite are already emitted once, site-wide, by the
// root layout (referenced here by @id); the BreadcrumbList is built by the
// page itself because Rank Math's points at WordPress category pages the
// public site doesn't have; Person nodes carry the author's email address.
const ARTICLE_TYPES = new Set(["BlogPosting", "Article", "NewsArticle"]);
const KEPT_TYPES = new Set([...ARTICLE_TYPES, "WebPage", "ImageObject"]);

const DROP = Symbol("drop");

export interface PostSchemaContext {
  /** Public canonical URL: https://bshsolutions.net/blog/{slug} */
  articleUrl: string;
  /** The post's own title (used for headline — Rank Math's is the SEO title, cut mid-word). */
  title: string;
  authorName: string;
  defaultAuthorName: string;
}

/**
 * Turns Rank Math's JSON-LD into nodes that are safe on the public domain:
 * URLs/@ids mapped to bshsolutions.net, HTML entities decoded, author PII
 * replaced, duplicate site-wide nodes removed. Returns null when Rank Math
 * gave no usable article node — or when anything CMS-hosted would still
 * leak through — so the caller can use its own schema instead.
 */
export function buildPublicPostSchema(seo: RankMathSeo | null, ctx: PostSchemaContext): JsonNode[] | null {
  if (!seo?.schema.length) return null;

  const typesOf = (node: JsonNode) => [node["@type"]].flat().filter((t): t is string => typeof t === "string");
  const kept = seo.schema.filter((node) => typesOf(node).some((t) => KEPT_TYPES.has(t)));
  const article = kept.find((node) => typesOf(node).some((t) => ARTICLE_TYPES.has(t)));
  if (!article) return null;

  const nodes = kept.map((node) => scrub(node)).filter((node): node is JsonNode => node !== DROP && isObject(node));
  const publicArticle = nodes.find((node) => typesOf(node).some((t) => ARTICLE_TYPES.has(t)));
  if (!publicArticle) return null;

  publicArticle.headline = ctx.title.slice(0, 110);
  publicArticle.name = ctx.title;
  publicArticle.author =
    ctx.authorName === ctx.defaultAuthorName
      ? { "@type": "Organization", name: ctx.authorName, url: SITE_URL }
      : { "@type": "Person", name: ctx.authorName };

  const webPageId = `${ctx.articleUrl}#webpage`;
  let webPage = nodes.find((node) => typesOf(node).includes("WebPage"));
  if (!webPage) {
    webPage = { "@type": "WebPage", "@id": webPageId, url: ctx.articleUrl, name: ctx.title };
    nodes.push(webPage);
  }
  webPage.url = ctx.articleUrl;
  webPage.isPartOf = { "@id": `${SITE_URL}/#website` };
  webPage.breadcrumb = { "@id": `${ctx.articleUrl}#breadcrumb` };
  publicArticle.isPartOf = { "@id": String(webPage["@id"] ?? webPageId) };
  publicArticle.mainEntityOfPage = { "@id": String(webPage["@id"] ?? webPageId) };
  publicArticle.publisher = { "@id": `${SITE_URL}/#organization` };

  return containsCmsPageUrl(nodes) ? null : nodes;
}

function isObject(value: unknown): value is JsonNode {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function scrub(value: unknown): unknown {
  if (typeof value === "string") {
    if (/^https?:\/\//i.test(value)) {
      const mapped = toPublicUrl(value);
      return mapped === null ? DROP : mapped;
    }
    return value.includes("&") ? wpToPlainText(value) : value;
  }

  if (Array.isArray(value)) {
    return value.map(scrub).filter((item) => item !== DROP);
  }

  if (isObject(value)) {
    const result: JsonNode = {};
    for (const [key, child] of Object.entries(value)) {
      const cleaned = scrub(child);
      if (cleaned !== DROP) result[key] = cleaned;
    }
    // A reference whose target has no public URL is meaningless — drop it.
    if ("@id" in value && !("@id" in result) && Object.keys(result).length === 0) return DROP;
    return result;
  }

  return value;
}

/** True if any string still points at a non-media page on the WordPress origin. */
function containsCmsPageUrl(value: unknown): boolean {
  if (typeof value === "string") {
    const urls = value.match(/https?:\/\/[^\s"'<>]+/gi) ?? [];
    return urls.some((raw) => {
      try {
        const url = new URL(raw);
        return isCmsHost(url.hostname) && !url.pathname.startsWith("/wp-");
      } catch {
        return false;
      }
    });
  }
  if (Array.isArray(value)) return value.some(containsCmsPageUrl);
  if (isObject(value)) return Object.values(value).some(containsCmsPageUrl);
  return false;
}

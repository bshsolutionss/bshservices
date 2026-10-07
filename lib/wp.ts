const BASE_URL = process.env.WORDPRESS_URL || "https://darkgrey-pelican-916395.hostingersite.com";
const API_URL =
  process.env.WORDPRESS_API_URL || `${BASE_URL.replace(/\/+$/, "")}/wp-json/wp/v2`;

export interface WPPost {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text: string;
    }>;
    author?: Array<{
      name: string;
      link?: string;
      description: string;
      avatar_urls: {
        [key: string]: string;
      };
    }>;
    "wp:term"?: Array<
      Array<{
        id: number;
        name: string;
        slug: string;
        taxonomy: "category" | "post_tag" | string;
      }>
    >;
  };
  yoast_head_json?: {
    title?: string;
    description?: string;
    og_title?: string;
    og_description?: string;
    og_image?: Array<{ url?: string }>;
    twitter_title?: string;
    twitter_description?: string;
    twitter_image?: string;
    robots?: string;
  };
}

export interface WPPostsPage {
  posts: WPPost[];
  total: number;
  totalPages: number;
}

const REQUEST_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 BSHSolutions/1.0",
  Accept: "application/json",
};

export async function getPostsPage(page = 1, perPage = 9): Promise<WPPostsPage> {
  const res = await fetch(
    `${API_URL}/posts?_embed&page=${page}&per_page=${perPage}`,
    {
      headers: REQUEST_HEADERS,
      next: { revalidate: 300 },
    },
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const posts = Array.isArray(data) ? data : [];
  return {
    posts,
    total: Number(res.headers.get("x-wp-total")) || posts.length,
    totalPages: Number(res.headers.get("x-wp-totalpages")) || (posts.length ? 1 : 0),
  };
}

export async function getPosts(page = 1, perPage = 10): Promise<WPPost[]> {
  return (await getPostsPage(page, perPage)).posts;
}

export async function getAllPosts(): Promise<WPPost[]> {
  const firstPage = await getPostsPage(1, 100);
  if (firstPage.totalPages <= 1) return firstPage.posts;

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
      getPosts(index + 2, 100),
    ),
  );
  return [...firstPage.posts, ...remainingPages.flat()];
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  if (!slug) return null;
  const cleanSlug = encodeURIComponent(slug.trim());
  const res = await fetch(`${API_URL}/posts?_embed&slug=${cleanSlug}`, {
    headers: REQUEST_HEADERS,
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch post by slug (${slug}): ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const post: WPPost | null = Array.isArray(data) && data.length > 0 ? data[0] : null;
  if (post && !post.yoast_head_json) {
    const seo = await getRankMathHead(post.link);
    if (seo) post.yoast_head_json = seo;
  }
  return post;
}

function headMeta(html: string, attr: "name" | "property", key: string): string {
  const tag = html.match(
    new RegExp(`<meta\\s[^>]*${attr}=["']${key}["'][^>]*>`, "i"),
  )?.[0];
  const content = tag?.match(/\scontent=(["'])([\s\S]*?)\1/i)?.[2];
  return wpToPlainText(content);
}

// This WordPress exposes neither Yoast nor Rank Math SEO fields over REST,
// but Rank Math renders them in the post's own <head>. Reading them from
// there keeps the SEO title/description/robots/OG data in this site identical
// to what editors set in Rank Math. Any failure returns null so callers fall
// back to the post's own title/excerpt — it must never break a page.
async function getRankMathHead(link: string | undefined): Promise<WPPost["yoast_head_json"] | null> {
  try {
    if (!link) return null;
    const cms = new URL(BASE_URL);
    const target = new URL(link);
    if (target.hostname !== cms.hostname) return null;
    const res = await fetch(target.toString(), {
      headers: { ...REQUEST_HEADERS, Accept: "text/html" },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const head = ((await res.text()).match(/<head[\s\S]*?<\/head>/i) ?? [""])[0];
    if (!head) return null;
    const title = wpToPlainText(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
    const ogImage = headMeta(head, "property", "og:image");
    return {
      title: title || undefined,
      description: headMeta(head, "name", "description") || undefined,
      robots: headMeta(head, "name", "robots") || undefined,
      og_title: headMeta(head, "property", "og:title") || undefined,
      og_description: headMeta(head, "property", "og:description") || undefined,
      og_image: ogImage ? [{ url: ogImage }] : undefined,
      twitter_title: headMeta(head, "name", "twitter:title") || undefined,
      twitter_description: headMeta(head, "name", "twitter:description") || undefined,
      twitter_image: headMeta(head, "name", "twitter:image") || undefined,
    };
  } catch {
    return null;
  }
}

export function getFeaturedImage(post: WPPost | null | undefined): string | null {
  if (!post) return null;
  return post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null;
}

// The WordPress media library's own alt text for the featured image, when
// an editor has actually set one — a more accurate image description than
// reusing the post title.
export function getFeaturedImageAlt(post: WPPost | null | undefined): string {
  if (!post) return "";
  return post._embedded?.["wp:featuredmedia"]?.[0]?.alt_text || "";
}

export function getPostCategories(post: WPPost | null | undefined): string[] {
  return (
    post?._embedded?.["wp:term"]
      ?.flat()
      .filter((term) => term.taxonomy === "category" && term.slug !== "uncategorized")
      .map((term) => term.name) ?? []
  );
}

export function getPostAuthorName(post: WPPost | null | undefined): string {
  const cmsName = wpToPlainText(post?._embedded?.author?.[0]?.name);
  return cmsName && !cmsName.includes("@") ? cmsName : "BSH Solutions Editorial Team";
}

export function getPostDescription(post: WPPost | null | undefined): string {
  if (!post) return "Read the latest insights from BSH Solutions.";
  const cmsDescription = wpToPlainText(post.yoast_head_json?.description);
  const excerpt = wpToPlainText(post.excerpt?.rendered);
  const content = wpToPlainText(post.content?.rendered);
  return cmsDescription || truncateAtWord(excerpt || content, 155);
}

export function getPostSeoTitle(post: WPPost | null | undefined): string {
  const rankMathTitle = wpToPlainText(post?.yoast_head_json?.title);
  if (rankMathTitle) return rankMathTitle;
  const sourceTitle = wpToPlainText(post?.title?.rendered) || "BSH Solutions Blog";
  const branded = `${sourceTitle} | BSH Solutions`;

  if (branded.length <= 65) return branded;

  const primaryTopic = sourceTitle.split(":", 1)[0].trim();
  const focusedBranded = `${primaryTopic} | BSH Solutions`;
  if (focusedBranded.length <= 65) return focusedBranded;

  return truncateAtWord(sourceTitle, 65);
}

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
    .replace(/\[(?:\s*\u2026\s*|\s*\.\.\.\s*)\]/g, "")
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

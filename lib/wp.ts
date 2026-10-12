import { cache } from "react";

import { getRankMathSeo, type RankMathSeo } from "@/lib/rankmath";
import { truncateAtWord, wpToPlainText } from "@/lib/wp-text";

export { truncateAtWord, wpToPlainText };

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
  /** Rank Math SEO fields (official getHead endpoint) — attached by getPostBySlug; null when unavailable. */
  seo?: RankMathSeo | null;
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

export const getPostBySlug = cache(async (slug: string): Promise<WPPost | null> => {
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
  if (post) post.seo = await getRankMathSeo(post.link);
  return post;
});

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

export const DEFAULT_AUTHOR_NAME = "BSH Solutions Editorial Team";

export function getPostAuthorName(post: WPPost | null | undefined): string {
  const cmsName = wpToPlainText(post?._embedded?.author?.[0]?.name);
  return cmsName && !cmsName.includes("@") ? cmsName : DEFAULT_AUTHOR_NAME;
}

export function getPostDescription(post: WPPost | null | undefined): string {
  if (!post) return "Read the latest insights from BSH Solutions.";
  const cmsDescription = wpToPlainText(post.seo?.description);
  const excerpt = wpToPlainText(post.excerpt?.rendered);
  const content = wpToPlainText(post.content?.rendered);
  return cmsDescription || truncateAtWord(excerpt || content, 155);
}

export function getPostSeoTitle(post: WPPost | null | undefined): string {
  const rankMathTitle = wpToPlainText(post?.seo?.title);
  if (rankMathTitle) return rankMathTitle;
  const sourceTitle = wpToPlainText(post?.title?.rendered) || "BSH Solutions Blog";
  const branded = `${sourceTitle} | BSH Solutions`;

  if (branded.length <= 65) return branded;

  const primaryTopic = sourceTitle.split(":", 1)[0].trim();
  const focusedBranded = `${primaryTopic} | BSH Solutions`;
  if (focusedBranded.length <= 65) return focusedBranded;

  return truncateAtWord(sourceTitle, 65);
}

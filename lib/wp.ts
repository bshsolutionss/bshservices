const BASE_URL = process.env.WORDPRESS_URL || "https://darkgrey-pelican-916395.hostingersite.com";
const API_URL =
  process.env.WORDPRESS_API_URL || `${BASE_URL.replace(/\/+$/, "")}/wp-json/wp/v2`;

export interface WPPost {
  id: number;
  date: string;
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
      description: string;
      avatar_urls: {
        [key: string]: string;
      };
    }>;
  };
}

export async function getPosts(page = 1, perPage = 10): Promise<WPPost[]> {
  try {
    const res = await fetch(
      `${API_URL}/posts?_embed&page=${page}&per_page=${perPage}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 BSHSolutions/1.0",
          Accept: "application/json",
        },
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) {
      console.error(`Failed to fetch posts: ${res.status} ${res.statusText}`);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  if (!slug) return null;
  try {
    const cleanSlug = encodeURIComponent(slug.trim());
    const res = await fetch(`${API_URL}/posts?_embed&slug=${cleanSlug}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 BSHSolutions/1.0",
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      console.error(`Failed to fetch post by slug (${slug}): ${res.status} ${res.statusText}`);
      return null;
    }
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error(`Error fetching post by slug (${slug}):`, error);
    return null;
  }
}

export function getFeaturedImage(post: WPPost | null | undefined): string | null {
  if (!post) return null;
  return post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null;
}

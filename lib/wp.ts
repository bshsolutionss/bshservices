const API_URL =
  process.env.WORDPRESS_API_URL || "https://darkgrey-pelican-916395.hostingersite.com/wp-json/wp/v2";

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
      { next: { revalidate: 60 } },
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch posts: ${res.statusText}`);
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  try {
    const res = await fetch(`${API_URL}/posts?_embed&slug=${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch post: ${res.statusText}`);
    }
    const data = await res.json();
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    return null;
  }
}

export function getFeaturedImage(post: WPPost): string | null {
  return post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null;
}

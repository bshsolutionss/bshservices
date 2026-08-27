import { MetadataRoute } from "next";
import { getPosts } from "@/lib/wp";
import { SERVICES, getServicePath } from "@/lib/services-data";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts(1, 100);

  const blogPostsEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
  }));

  // All 30 sub-service pages, generated from the same data file the pages render from.
  const servicePageEntries: MetadataRoute.Sitemap = SERVICES.map((service) => ({
    url: `${SITE_URL}${getServicePath(service)}`,
    lastModified: new Date(),
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/portfolio`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/Services`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/Services/development`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/Services/designing`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/Services/marketing`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/Services/photography`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/Services/ai`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
    },
    ...servicePageEntries,
    ...blogPostsEntries,
  ];
}

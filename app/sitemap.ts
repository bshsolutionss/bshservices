import { MetadataRoute } from "next";
import { getPosts } from "@/lib/wp";
import { SERVICES, getServicePath } from "@/lib/services-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts(1, 100);

  const blogPostsEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `https://bshsolutionss.com/blog/${post.slug}`,
    lastModified: new Date(post.date),
  }));

  // All 30 sub-service pages, generated from the same data file the pages render from.
  const servicePageEntries: MetadataRoute.Sitemap = SERVICES.map((service) => ({
    url: `https://bshsolutionss.com${getServicePath(service)}`,
    lastModified: new Date(),
  }));

  return [
    {
      url: "https://bshsolutionss.com",
      lastModified: new Date(),
    },
    {
      url: "https://bshsolutionss.com/about",
      lastModified: new Date(),
    },
    {
      url: "https://bshsolutionss.com/contact",
      lastModified: new Date(),
    },
    {
      url: "https://bshsolutionss.com/portfolio",
      lastModified: new Date(),
    },
    {
      url: "https://bshsolutionss.com/Services",
      lastModified: new Date(),
    },
    {
      url: "https://bshsolutionss.com/Services/development",
      lastModified: new Date(),
    },
    {
      url: "https://bshsolutionss.com/Services/designing",
      lastModified: new Date(),
    },
    {
      url: "https://bshsolutionss.com/Services/marketing",
      lastModified: new Date(),
    },
    {
      url: "https://bshsolutionss.com/Services/photography",
      lastModified: new Date(),
    },
    {
      url: "https://bshsolutionss.com/Services/ai",
      lastModified: new Date(),
    },
    {
      url: "https://bshsolutionss.com/blog",
      lastModified: new Date(),
    },
    ...servicePageEntries,
    ...blogPostsEntries,
  ];
}

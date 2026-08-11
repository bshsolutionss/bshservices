import { MetadataRoute } from "next";
import { getPosts } from "@/lib/wp";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts(1, 100);

  const blogPostsEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `https://bshsolutionss.com/blog/${post.slug}`,
    lastModified: new Date(post.date),
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
      url: "https://bshsolutionss.com/blog",
      lastModified: new Date(),
    },
    ...blogPostsEntries,
  ];
}

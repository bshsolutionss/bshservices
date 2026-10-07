import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/wp";
import { SERVICES, getServicePath } from "@/lib/services-data";
import { SITE_URL } from "@/lib/site";
import { PORTFOLIO_PROJECTS, getProjectPath } from "@/lib/portfolio-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();

  const blogPostsEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.modified || post.date),
  }));

  // Static/service dates are deliberately omitted: emitting the current time
  // on every sitemap request makes lastmod untrustworthy to search engines.
  const servicePageEntries: MetadataRoute.Sitemap = SERVICES.map((service) => ({
    url: `${SITE_URL}${getServicePath(service)}`,
  }));

  // One case-study page per portfolio project.
  const portfolioEntries: MetadataRoute.Sitemap = PORTFOLIO_PROJECTS.map((project) => ({
    url: `${SITE_URL}${getProjectPath(project)}`,
  }));

  return [
    {
      url: SITE_URL,
    },
    {
      url: `${SITE_URL}/about`,
    },
    {
      url: `${SITE_URL}/contact`,
    },
    {
      url: `${SITE_URL}/book-consultation`,
    },
    {
      url: `${SITE_URL}/portfolio`,
    },
    {
      url: `${SITE_URL}/Services`,
    },
    {
      url: `${SITE_URL}/Services/development`,
    },
    {
      url: `${SITE_URL}/Services/designing`,
    },
    {
      url: `${SITE_URL}/Services/marketing`,
    },
    {
      url: `${SITE_URL}/Services/photography`,
    },
    {
      url: `${SITE_URL}/Services/ai`,
    },
    {
      url: `${SITE_URL}/blog`,
    },
    ...portfolioEntries,
    ...servicePageEntries,
    ...blogPostsEntries,
  ];
}

/**
 * Manually curated links from service pages to the specific blog posts that
 * are actually about that service — real topical relevance, not "every
 * page links every post." Used by RelatedBlogPosts on service detail pages
 * and category overview pages.
 */
export interface BlogLink {
  slug: string;
  title: string;
}

export const SERVICE_BLOG_LINKS: Record<string, BlogLink[]> = {
  "website-development": [
    { slug: "web-development-services", title: "Web Development Services: Ecommerce, UX And Tablet Apps" },
    { slug: "wordpress-development-services", title: "WordPress Development Services: How To Choose The Right Partner" },
  ],
  "web-application-development": [
    { slug: "saas-development-service", title: "SaaS Development Service: A Complete Guide For Founders" },
  ],
  "custom-software-development": [
    { slug: "saas-development-service", title: "SaaS Development Service: A Complete Guide For Founders" },
  ],
  "ppc-advertising": [
    { slug: "ppc-company-guide", title: "PPC Company Guide: How To Choose The Right Paid Search Partner" },
  ],
  "social-media-marketing": [
    {
      slug: "digital-marketing-services-for-small-business",
      title: "Digital Marketing Services For Small Business: A Complete Guide",
    },
  ],
  "seo-optimization": [
    {
      slug: "digital-marketing-services-for-small-business",
      title: "Digital Marketing Services For Small Business: A Complete Guide",
    },
  ],
  "email-marketing": [
    {
      slug: "digital-marketing-services-for-small-business",
      title: "Digital Marketing Services For Small Business: A Complete Guide",
    },
  ],
};

export const CATEGORY_BLOG_LINKS: Record<string, BlogLink[]> = {
  development: [
    { slug: "web-development-services", title: "Web Development Services: Ecommerce, UX And Tablet Apps" },
    { slug: "wordpress-development-services", title: "WordPress Development Services: How To Choose The Right Partner" },
    { slug: "saas-development-service", title: "SaaS Development Service: A Complete Guide For Founders" },
  ],
  marketing: [
    { slug: "ppc-company-guide", title: "PPC Company Guide: How To Choose The Right Paid Search Partner" },
    {
      slug: "digital-marketing-services-for-small-business",
      title: "Digital Marketing Services For Small Business: A Complete Guide",
    },
  ],
};

import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Admin panel and API routes are private/authenticated — nothing there
      // is meant for search results, and there's no reason to advertise
      // their existence to crawlers (including hostile ones probing for
      // exposed admin panels).
      disallow: ["/admin", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

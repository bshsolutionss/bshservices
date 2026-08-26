import type { ServiceDefinition } from "@/lib/services-data";
import { SERVICE_CATEGORIES, getServicePath } from "@/lib/services-data";
import { SERVICE_ARTICLES } from "@/lib/services-articles";
import { safeJsonLd } from "@/lib/json-ld";

interface ServiceJsonLdProps {
  service: ServiceDefinition;
}

/** Service structured data (schema.org/Service) for the detail page. */
export default function ServiceJsonLd({ service }: ServiceJsonLdProps) {
  const category = SERVICE_CATEGORIES[service.category];
  const url = `https://bshsolutionss.com${getServicePath(service)}`;
  const article = SERVICE_ARTICLES[service.slug];
  // The real content file's own title/intro when there is one — schema
  // should describe the page the same way the visible page does.
  const name = article?.title ?? service.name;
  const description = article ? article.intro.join(" ") : service.description;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url,
    serviceType: service.name,
    category: category.name,
    provider: {
      "@type": "Organization",
      name: "BSH Solutions",
      url: "https://bshsolutionss.com",
    },
    areaServed: "Worldwide",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
    />
  );
}

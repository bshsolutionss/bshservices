import type { ServiceDefinition } from "@/lib/services-data";
import { SERVICE_CATEGORIES, getServicePath } from "@/lib/services-data";
import { SERVICE_ARTICLES } from "@/lib/services-articles";
import { safeJsonLd } from "@/lib/json-ld";
import { SITE_URL } from "@/lib/site";
import { SERVICE_SEO } from "@/lib/service-seo";
import { ORGANIZATION_ID } from "@/lib/seo";

interface ServiceJsonLdProps {
  service: ServiceDefinition;
}

/** Service structured data (schema.org/Service) for the detail page. */
export default function ServiceJsonLd({ service }: ServiceJsonLdProps) {
  const category = SERVICE_CATEGORIES[service.category];
  const url = `${SITE_URL}${getServicePath(service)}`;
  const article = SERVICE_ARTICLES[service.slug];
  // The real content file's own title/intro when there is one — schema
  // should describe the page the same way the visible page does.
  const name = article?.title ?? service.name;
  const description = article ? article.intro.join(" ") : service.description;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name,
    description,
    disambiguatingDescription: SERVICE_SEO[service.slug]?.description ?? service.shortDescription,
    url,
    image: `${SITE_URL}${service.image}`,
    serviceType: service.name,
    category: category.name,
    // Points at the full Organization entity the root layout emits.
    provider: { "@id": ORGANIZATION_ID },
    brand: { "@id": ORGANIZATION_ID },
    areaServed: "Worldwide",
    ...(service.keywords.length > 0 && { keywords: service.keywords.join(", ") }),
    mainEntityOfPage: url,
    potentialAction: {
      "@type": "ReserveAction",
      name: "Book a free consultation",
      target: `${SITE_URL}/book-consultation`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
    />
  );
}

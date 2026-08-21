import type { ServiceDefinition } from "@/lib/services-data";
import { SERVICE_CATEGORIES, getServicePath } from "@/lib/services-data";
import { safeJsonLd } from "@/lib/json-ld";

interface ServiceJsonLdProps {
  service: ServiceDefinition;
}

/** Service structured data (schema.org/Service) for the detail page. */
export default function ServiceJsonLd({ service }: ServiceJsonLdProps) {
  const category = SERVICE_CATEGORIES[service.category];
  const url = `https://bshsolutionss.com${getServicePath(service)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
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

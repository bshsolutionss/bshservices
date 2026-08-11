/**
 * Factory that wires a category slug up to a full Next.js page module
 * (`generateStaticParams`, `generateMetadata`, and the page component).
 *
 * Every `app/Services/<category>/[service]/page.tsx` file just calls this
 * once and re-exports the result — see any of those files for the ~6-line
 * usage. All lookup/404/metadata logic lives here, in one place.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  SERVICE_CATEGORIES,
  getService,
  getServicesByCategory,
  getServicePath,
  type ServiceCategorySlug,
} from "@/lib/services-data";
import ServiceDetailPage from "@/components/services/detail/ServiceDetailPage";

type PageProps = {
  params: Promise<{ service: string }>;
};

export function makeServiceCategoryPage(category: ServiceCategorySlug) {
  function generateStaticParams() {
    return getServicesByCategory(category).map((service) => ({ service: service.slug }));
  }

  async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { service: slug } = await params;
    const service = getService(category, slug);

    if (!service) {
      return { title: "Service Not Found" };
    }

    const path = getServicePath(service);
    const url = `https://bshsolutionss.com${path}`;
    const title = `${service.name} Services`;

    return {
      title,
      description: service.shortDescription,
      keywords: service.keywords,
      alternates: { canonical: url },
      openGraph: {
        title: `${title} | BSH Solutions`,
        description: service.shortDescription,
        url,
        type: "website",
        images: [{ url: `https://bshsolutionss.com${service.image}`, alt: service.name }],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | BSH Solutions`,
        description: service.shortDescription,
        images: [`https://bshsolutionss.com${service.image}`],
      },
    };
  }

  async function ServicePage({ params }: PageProps) {
    const { service: slug } = await params;
    const service = getService(category, slug);

    if (!service) {
      notFound();
    }

    return <ServiceDetailPage service={service} />;
  }

  return { generateStaticParams, generateMetadata, ServicePage };
}

// Re-exported so category overview pages / nav can link without importing lib/services-data directly.
export { SERVICE_CATEGORIES };

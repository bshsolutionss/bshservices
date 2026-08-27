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
import { SERVICE_ARTICLES, truncateForMeta } from "@/lib/services-articles";
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
    // Relative — resolved against the root layout's metadataBase (lib/site.ts's
    // SITE_URL), so this factory (shared by all ~30 sub-service pages) never
    // needs to hardcode the domain itself.
    const article = SERVICE_ARTICLES[service.slug];
    const title = article?.title ?? `${service.name} Services`;
    const description = article ? truncateForMeta(article.intro.join(" "), 160) : service.shortDescription;

    return {
      title,
      description,
      keywords: service.keywords,
      alternates: { canonical: path },
      openGraph: {
        title: `${title} | BSH Solutions`,
        description,
        url: path,
        type: "website",
        images: [{ url: service.image, alt: title }],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | BSH Solutions`,
        description,
        images: [service.image],
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

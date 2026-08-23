import type { ServiceCategorySlug, ServiceDefinition } from "@/lib/services-data";
import { SERVICE_CATEGORIES, getRelatedServices } from "@/lib/services-data";
import { getProcessSteps, getWhyChooseUs, getCtaContent } from "@/lib/services-content";
import { SERVICE_ARTICLES } from "@/lib/services-articles";

import Hero from "@/components/services/Hero";
import ServiceSection from "@/components/services/ServiceSection";
import Form from "@/components/services/Form";
import Testimonial from "@/components/testimonial";

import Breadcrumbs from "@/components/services/detail/Breadcrumbs";
import ServiceJsonLd from "@/components/services/detail/ServiceJsonLd";
import Benefits from "@/components/services/detail/Benefits";
import ProcessSteps from "@/components/services/detail/ProcessSteps";
import WhyChooseUs from "@/components/services/detail/WhyChooseUs";
import FaqAccordion from "@/components/services/detail/FaqAccordion";
import RelatedServices from "@/components/services/detail/RelatedServices";
import ServiceCta from "@/components/services/detail/ServiceCta";
import ServiceArticleSection from "@/components/services/detail/ServiceArticle";

const FORM_SERVICE_NAME: Record<
  ServiceCategorySlug,
  "Development" | "Designing" | "Marketing" | "Photography" | "AI Services"
> = {
  development: "Development",
  designing: "Designing",
  marketing: "Marketing",
  photography: "Photography",
  ai: "AI Services",
};

interface ServiceDetailPageProps {
  service: ServiceDefinition;
}

/**
 * The single reusable template every one of the 30 service pages renders
 * through. Route files only look up the `ServiceDefinition` and pass it in —
 * all layout/section logic lives here.
 */
export default function ServiceDetailPage({ service }: ServiceDetailPageProps) {
  const category = SERVICE_CATEGORIES[service.category];
  const related = getRelatedServices(service);
  const cta = getCtaContent(service);
  const article = SERVICE_ARTICLES[service.slug];

  return (
    <>
      <ServiceJsonLd service={service} />

      <Hero title={service.name} subtitle={service.shortDescription} image={service.image} />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/Services" },
          { label: category.name, href: category.overviewPath },
          { label: service.name },
        ]}
      />

      {/* Overview + Features + Technologies (reuses the site's existing ServiceSection block) */}
      <ServiceSection
        title="Overview"
        description={service.description}
        features={service.features}
        tech={service.technologies.map((t) => ({
          name: t.name,
          icon: <t.icon color={t.color} />,
        }))}
        image={service.image}
        cta="Get a Free Quote"
      />

      <Benefits title={`Benefits of ${service.name}`} benefits={service.benefits} />

      {article && <ServiceArticleSection article={article} />}

      <ProcessSteps steps={getProcessSteps(service)} />

      <WhyChooseUs serviceName={service.name} points={getWhyChooseUs(service.category)} />

      <FaqAccordion serviceName={service.name} faqs={service.faqs} />

      <RelatedServices services={related} />

      <Testimonial />

      <div className="bg-[#F4F7FE]">
        <ServiceCta heading={cta.heading} subtext={cta.subtext} />
        <Form serviceName={FORM_SERVICE_NAME[service.category]} />
      </div>
    </>
  );
}

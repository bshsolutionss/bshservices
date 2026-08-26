import type { ServiceCategorySlug, ServiceDefinition } from "@/lib/services-data";
import { SERVICE_CATEGORIES, getRelatedServices } from "@/lib/services-data";
import { getProcessSteps, getWhyChooseUs, getCtaContent } from "@/lib/services-content";
import { SERVICE_ARTICLES, truncateForMeta } from "@/lib/services-articles";

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
import RelatedBlogPosts from "@/components/services/detail/RelatedBlogPosts";
import { SERVICE_BLOG_LINKS } from "@/lib/blog-links";

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
  // The article already has its own real, content-driven "Our X Process"
  // timeline when it has one — render the generic auto-generated
  // ProcessSteps only for services where it doesn't, to avoid two
  // near-identical "how we work" sections on the same page.
  const articleHasProcess = article?.sections.some(
    (section) => section.kind === "list" && section.listKind === "process"
  );
  // The real content file's own title/intro/FAQs — not the short generic
  // service.name or hand-authored placeholder copy. Falls back to the
  // (still generic) services-data.ts fields only for the one service that
  // has no content file yet.
  const heroTitle = article?.title ?? service.name;
  const heroSubtitle = article ? truncateForMeta(article.intro.join(" "), 220) : service.shortDescription;
  const faqs = article?.faqs ?? service.faqs;

  return (
    <>
      <ServiceJsonLd service={service} />

      <Hero title={heroTitle} subtitle={heroSubtitle} image={service.image} />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/Services" },
          { label: category.name, href: category.overviewPath },
          { label: service.name },
        ]}
      />

      {/* Overview + Features + Technologies — only for the services that don't
          have a real content article yet. Once an article exists, its actual
          intro and "Our X Services" grid already cover this, better and for
          real, so this hand-authored placeholder block would just be
          duplicate (and, since it isn't sourced from content/*.md, fake). */}
      {!article && (
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
      )}

      {!article && <Benefits title={`Benefits of ${service.name}`} benefits={service.benefits} />}

      {article && (
        <ServiceArticleSection article={article} image={service.image} imageAlt={heroTitle} />
      )}

      {!articleHasProcess && <ProcessSteps steps={getProcessSteps(service)} />}

      <WhyChooseUs serviceName={service.name} points={getWhyChooseUs(service.category)} />

      <FaqAccordion serviceName={heroTitle} faqs={faqs} />

      <RelatedBlogPosts posts={SERVICE_BLOG_LINKS[service.slug] ?? []} />

      <RelatedServices services={related} />

      <Testimonial />

      <div className="bg-[#F4F7FE]">
        <ServiceCta heading={cta.heading} subtext={cta.subtext} />
        <Form serviceName={FORM_SERVICE_NAME[service.category]} />
      </div>
    </>
  );
}

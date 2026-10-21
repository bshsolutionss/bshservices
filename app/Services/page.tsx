import type { Metadata } from "next";
import Services from "@/components/services";
import Testimonial from "@/components/testimonial";
import Faq from "@/components/faq";

import Contactform from "@/components/contactform";

import ProcessFlow from "@/components/ProcessFlow";

import { OurPortfolio } from "@/components/our-portfolio";

import OurTechnologies from "@/components/Ourtechnologies";
import JsonLd from "@/components/JsonLd";
import { itemListJsonLd, pageMetadata, webPageJsonLd } from "@/lib/seo";
import { SERVICE_CATEGORIES } from "@/lib/services-data";

const TITLE = "Web, AI, Design & Marketing Services | BSH Solutions";
const DESCRIPTION =
  "Explore BSH Solutions services: web and software development, UI/UX and brand design, SEO and digital marketing, AI automation, photography and video.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/Services",
  keywords: [
    "BSH Solutions services",
    "web development services",
    "digital marketing agency",
    "AI automation services",
    "UI/UX design services",
    "photography services",
  ],
});

const page = () => {
  return (
    <div>
      <JsonLd
        data={webPageJsonLd({
          type: "CollectionPage",
          name: TITLE,
          description: DESCRIPTION,
          path: "/Services",
          breadcrumbs: [
            { name: "Home", path: "/" },
            { name: "Services", path: "/Services" },
          ],
          extra: [
            itemListJsonLd(
              "BSH Solutions services",
              Object.values(SERVICE_CATEGORIES).map((c) => ({ name: c.name, path: c.overviewPath })),
            ),
          ],
        })}
      />
      {/* This page has no separate Hero — "Our Services" below is this page's own H1. */}
      <Services headingLevel="h1" />
      <ProcessFlow />
      <OurTechnologies />
      <OurPortfolio limit={6} showViewAll={true} />
      <Testimonial />
      <Faq schema={false} />
      <Contactform />
    </div>
  );
};

export default page;

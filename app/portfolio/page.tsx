import type { Metadata } from "next";
import Contactform from "@/components/contactform";
import { OurPortfolio } from "@/components/our-portfolio";
import { safeJsonLd } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/seo";
import { PORTFOLIO_PROJECTS, portfolioIndexJsonLd } from "@/lib/portfolio-data";

const TITLE = "Web Design & Development Portfolio | BSH Solutions";
const DESCRIPTION =
  "Live client projects by BSH Solutions: business websites, eCommerce stores, dashboards and custom software. Preview each site or read the full case study.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/portfolio",
  keywords: [
    "BSH Solutions portfolio",
    "web development projects",
    "client case studies",
    "live websites",
    "eCommerce website examples",
    "custom software examples",
  ],
  image: { url: PORTFOLIO_PROJECTS[0].image, alt: `${PORTFOLIO_PROJECTS[0].title} website` },
});

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-[#F4F7FE]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(portfolioIndexJsonLd()) }}
      />

      {/* Page heading (the site header comes from the shared layout) */}
      <section className="px-6 pb-2 pt-32 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#1A14A5] lg:text-6xl">
            Our Client <span className="text-[#231F20]">Projects</span>
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#231F20]/70">
            Real live websites, dashboards, SaaS platforms, and scalable digital
            experiences crafted for our clients worldwide. Open any project to
            preview it on a computer screen or read the full case study.
          </p>
        </div>
      </section>

      <OurPortfolio showHeading={false} className="pt-8 lg:pt-10" />

      <Contactform />
    </div>
  );
}

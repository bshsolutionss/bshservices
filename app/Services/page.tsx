import type { Metadata } from "next";
import Services from "@/components/services";
import Testimonial from "@/components/testimonial";
import Faq from "@/components/faq";

import Contactform from "@/components/contactform";

import ProcessFlow from "@/components/ProcessFlow";

import { OurPortfolio } from "@/components/our-portfolio";

import OurTechnologies from "@/components/Ourtechnologies";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Explore BSH Solutions' full range of services — web & software development, UI/UX design, digital marketing, AI automation, and photography — built to scale your business.",
  keywords: [
    "BSH Solutions services",
    "web development services",
    "digital marketing agency",
    "AI automation services",
  ],
  alternates: { canonical: "/Services" },
  openGraph: {
    title: "Our Services | BSH Solutions",
    description:
      "Web & software development, design, marketing, AI automation, and photography services built to scale your business.",
    url: "/Services",
  },
};

const page = () => {
  return (
    <div>
      {/* This page has no separate Hero — "Our Services" below is this page's own H1. */}
      <Services headingLevel="h1" />
      <ProcessFlow />
      <OurTechnologies />
      <OurPortfolio limit={6} showViewAll={true} />
      <Testimonial />
      <Faq />
      <Contactform />
    </div>
  );
};

export default page;

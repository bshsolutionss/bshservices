import Heros from "@/components/heros";
import Services from "@/components/services";
// import Testimonial from "@/components/testimonial";
import About from "@/components/about";
import MovingText from "@/components/MovingText";
import "./globals.css";
import JsonLd from "@/components/JsonLd";
import { pageMetadata, webPageJsonLd } from "@/lib/seo";
import dynamic from "next/dynamic";

import { StatCounter } from "@/components/stat-counter";

const TITLE = "BSH Solutions | Web Development, AI & Digital Marketing";
const DESCRIPTION =
  "BSH Solutions (Business Smart Hub) builds fast websites, custom software and AI chatbots, and grows brands with SEO and digital marketing. Get a free quote.";

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/" });

// Below-the-fold sections are code-split so the first load ships less JS
// (they still server-render, so SEO and no-JS content are unaffected).
const PricingSection = dynamic(() => import("@/components/pricing-section"));
const OurPortfolio = dynamic(() =>
  import("@/components/our-portfolio").then((m) => m.OurPortfolio),
);
const ProcessFlow = dynamic(() => import("@/components/ProcessFlow"));
const OurTechnologies = dynamic(() => import("@/components/Ourtechnologies"));
const Faq = dynamic(() => import("@/components/faq"));
const Contactform = dynamic(() => import("@/components/contactform"));

// Deliberately not reading headers()/cookies() here — either would force
// this whole page to render dynamically on every single visit (Vercel
// bills/limits Hobby-plan function invocations, so the highest-traffic page
// on the site is the last one that should be forced dynamic). PricingSection
// now self-corrects the GLOBAL→PK region client-side instead — see its own
// comment for why.
const page = () => {
  return (
    <div>
      <JsonLd data={webPageJsonLd({ name: TITLE, description: DESCRIPTION, path: "/" })} />
      <Heros />
      <StatCounter />
      <MovingText />

      <About />
      <Services />
      <PricingSection />
      <OurPortfolio limit={6} showViewAll={true} />
      <ProcessFlow />
      <OurTechnologies />

      {/* <Testimonial /> */}
      <Faq />
      <Contactform />
    </div>
  );
};

export default page;

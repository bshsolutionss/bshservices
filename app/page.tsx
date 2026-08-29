import Heros from "@/components/heros";
import Services from "@/components/services";
// import Testimonial from "@/components/testimonial";
import Faq from "@/components/faq";
import About from "@/components/about";
import Contactform from "@/components/contactform";
import MovingText from "@/components/MovingText";
import ProcessFlow from "@/components/ProcessFlow";
import "./globals.css";
import PricingSection from "@/components/pricing-section";
import { OurPortfolio } from "@/components/our-portfolio";

import { StatCounter } from "@/components/stat-counter";
import OurTechnologies from "@/components/Ourtechnologies";

// Deliberately not reading headers()/cookies() here — either would force
// this whole page to render dynamically on every single visit (Vercel
// bills/limits Hobby-plan function invocations, so the highest-traffic page
// on the site is the last one that should be forced dynamic). PricingSection
// now self-corrects the GLOBAL→PK region client-side instead — see its own
// comment for why.
const page = () => {
  return (
    <div>
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

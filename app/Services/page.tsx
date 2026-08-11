import Services from "@/components/services";
import Testimonial from "@/components/testimonial";
import Faq from "@/components/faq";

import Contactform from "@/components/contactform";

import ProcessFlow from "@/components/ProcessFlow";

import { OurPortfolio } from "@/components/our-portfolio";

import OurTechnologies from "@/components/Ourtechnologies";

const page = () => {
  return (
    <div>
      <Services />
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

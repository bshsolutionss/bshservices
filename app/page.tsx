import React from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Heros from "@/components/heros";
import Services from "@/components/services";
// import Testimonial from "@/components/testimonial";
import Faq from "@/components/faq";
import About from "@/components/about";
import Contactform from "@/components/contactform";
// import MovingText from "@/components/MovingText";
import ProcessFlow from "@/components/ProcessFlow";
import "./globals.css";
// import Portfolio from "@/components/portfolio";

import { StatCounter } from "@/components/stat-counter";
import OurTechnologies from "@/components/Ourtechnologies";

const page = () => {
  return (
    <div>
      <Header />
      <Heros />
      <StatCounter />
      {/* <MovingText /> */}

      <About />
      <Services />
      <ProcessFlow />
      <OurTechnologies />
      {/* <Portfolio /> */}
      {/* <Testimonial /> */}
      <Faq />
      <Contactform />

      <Footer />
    </div>
  );
};

export default page;

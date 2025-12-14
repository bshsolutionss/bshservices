import React from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";

import Services from "@/components/services";
// import Testimonial from "@/components/testimonial";
import Faq from "@/components/faq";

import Contactform from "@/components/contactform";

import ProcessFlow from "@/components/ProcessFlow";

// import Portfolio from "@/components/portfolio";


import OurTechnologies from "@/components/Ourtechnologies";


const page = () => {


  
  return (
    <div>
      <Header />

      
       
   
 
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

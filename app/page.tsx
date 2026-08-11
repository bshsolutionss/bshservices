import React from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Heros from "@/components/heros";
import Services from "@/components/services";
import Testimonial from "@/components/testimonial";
import Faq from "@/components/faq";
import About from "@/components/about";
import Contactform from "@/components/contactform";
import { OurPortfolio } from "@/components/our-portfolio";
// import { StickyCard002 } from "@/components/StickyCard";
import { StatCounter } from "@/components/stat-counter"


const page = () => {
  return (
    <div>
      <Header />
      <Heros />
        <StatCounter />
      <About />
      <Services />
      <OurPortfolio limit={6} showViewAll={true} />

        {/* <div className="h-screen w-full bg-gray-900">
      <StickyCard002
        cards={cards}
        className="bg-gradient-to-br from-gray-900 to-black"
        containerClassName="rounded-2xl shadow-2xl"
        imageClassName="object-cover"
      />
    </div> */}
    

      

      <Testimonial />
      <Faq />
      <Contactform />

      <Footer />
    </div>
  );
};

export default page;

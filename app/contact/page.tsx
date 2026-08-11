"use client";

import Hero from "@/components/services/Hero";
import Testimonial from "@/components/testimonial";

import Faq from "@/components/faq";
import Contactform from "@/components/contactform";

import GoogleMap from "@/components/googlemap";

const page = () => {
  return (
    <>
      <Hero
        title="Get In Touch"
        subtitle="We'd love to hear from you. Contact us for any inquiries or to discuss your project."
        image="/images/3dlogo.jpeg"
      />
      <Contactform />

      <div>
        <GoogleMap />
      </div>

      <Testimonial />
      <Faq />
    </>
  );
};

export default page;

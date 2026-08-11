import type { Metadata } from "next";
import Hero from "@/components/services/Hero";
import Testimonial from "@/components/testimonial";

import Faq from "@/components/faq";
import Contactform from "@/components/contactform";

import GoogleMap from "@/components/googlemap";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with BSH Solutions. Reach out for web development, software, marketing, or IT consulting inquiries — we'd love to hear about your project.",
  keywords: [
    "Contact BSH Solutions",
    "Get a quote",
    "IT consulting contact",
    "Business Smart Hub contact",
  ],
  alternates: { canonical: "https://bshsolutionss.com/contact" },
  openGraph: {
    title: "Contact BSH Solutions",
    description:
      "Reach out to BSH Solutions for web development, software, marketing, or IT consulting inquiries.",
    url: "https://bshsolutionss.com/contact",
  },
};

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

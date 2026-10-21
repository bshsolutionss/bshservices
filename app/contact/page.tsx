import type { Metadata } from "next";
import Hero from "@/components/services/Hero";
import Testimonial from "@/components/testimonial";

import Faq from "@/components/faq";
import Contactform from "@/components/contactform";

import GoogleMap from "@/components/googlemap";
import JsonLd from "@/components/JsonLd";
import { ORGANIZATION_ID, pageMetadata, webPageJsonLd } from "@/lib/seo";

const TITLE = "Contact BSH Solutions | Get a Free Project Quote";
const DESCRIPTION =
  "Contact BSH Solutions for web development, custom software, AI automation or digital marketing. Call, email or WhatsApp us and get a free project quote.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/contact",
  keywords: ["Contact BSH Solutions", "get a website quote", "hire web developers", "digital marketing agency contact", "Business Smart Hub contact"],
});

const page = () => {
  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          type: "ContactPage",
          name: TITLE,
          description: DESCRIPTION,
          path: "/contact",
          breadcrumbs: [
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ],
          page: { mainEntity: { "@id": ORGANIZATION_ID } },
        })}
      />
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
      <Faq schema={false} />
    </>
  );
};

export default page;

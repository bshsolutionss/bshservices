import type { Metadata } from "next";
import Hero from "@/components/services/Hero";
import Testimonial from "@/components/testimonial";
import BookingForm from "@/components/BookingForm";
import JsonLd from "@/components/JsonLd";
import { ORGANIZATION_ID, pageMetadata, webPageJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

const TITLE = "Book a Free Consultation | BSH Solutions";
const DESCRIPTION =
  "Book a free, no-obligation consultation with BSH Solutions. Pick a time, tell us about your website, software, AI or marketing project and get a clear plan.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/book-consultation",
  keywords: ["book a consultation", "free consultation", "web development consultation", "AI automation consultation", "schedule a call"],
});

export default function BookConsultationPage() {
  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          type: "WebPage",
          name: TITLE,
          description: DESCRIPTION,
          path: "/book-consultation",
          breadcrumbs: [
            { name: "Home", path: "/" },
            { name: "Book a Consultation", path: "/book-consultation" },
          ],
          page: {
            potentialAction: {
              "@type": "ReserveAction",
              name: "Book a free consultation",
              target: `${SITE_URL}/book-consultation`,
              provider: { "@id": ORGANIZATION_ID },
            },
          },
        })}
      />
      <Hero
        title="Book a Free Consultation"
        subtitle="Pick a date and time that works for you. We'll walk through your project, answer questions, and map out next steps, no obligation."
        image="/images/3dlogo.jpeg"
      />

      <section className="py-20 px-6 bg-[#F4F7FE]">
        <BookingForm />

        <div className="max-w-xl mx-auto mt-8 text-center text-sm text-[#231F20]/75">
          Prefer to discuss via email or share RFP specifications directly? Reach our sales team at{" "}
          <a
            href="mailto:sales@bshsolutions.net"
            className="font-semibold text-[#1A14A5] hover:underline"
          >
            sales@bshsolutions.net
          </a>
        </div>
      </section>

      <Testimonial />
    </>
  );
}

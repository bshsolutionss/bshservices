import type { Metadata } from "next";
import Hero from "@/components/services/Hero";
import About from "@/components/about";
import ProcessFlow from "@/components/ProcessFlow";
import Faq from "@/components/faq";
import Contactform from "@/components/contactform";
import OurTeamSection from "@/components/Ourteam";
import Testimonial from "@/components/testimonial";

// ==== ICONS IMPORTS ====
import {
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiTailwindcss,
  SiWordpress,
  SiPhp,
  SiMeta,
  SiGoogleanalytics,
} from "react-icons/si";
import JsonLd from "@/components/JsonLd";
import { ORGANIZATION_ID, pageMetadata, webPageJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

const TITLE = "About BSH Solutions | Web, AI & Marketing Team";
const DESCRIPTION =
  "Meet the team behind BSH Solutions (Business Smart Hub): developers, designers and marketers building websites, software and AI automation for growing brands.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/about",
  keywords: ["About BSH Solutions", "Business Smart Hub team", "software house", "web development agency", "AI automation agency"],
});

const page = () => {
  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          type: "AboutPage",
          name: TITLE,
          description: DESCRIPTION,
          path: "/about",
          breadcrumbs: [
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ],
          extra: [
            {
              "@type": "Person",
              name: "Muhammad Bilal",
              jobTitle: "Full Stack Developer & SEO Specialist",
              email: "mailto:bilal@bshsolutions.net",
              image: `${SITE_URL}/team/bilal.jpeg`,
              worksFor: { "@id": ORGANIZATION_ID },
              knowsAbout: ["React", "Next.js", "Node.js", "Tailwind CSS", "SEO"],
            },
            {
              "@type": "Person",
              name: "Muhammad Shahzaib",
              jobTitle: "Website Developer & Digital Marketer",
              email: "mailto:shahzaib@bshsolutions.net",
              image: `${SITE_URL}/team/shahzaib.jpeg`,
              worksFor: { "@id": ORGANIZATION_ID },
              knowsAbout: ["WordPress", "PHP", "Meta Ads", "Google Analytics", "Digital Marketing"],
            },
          ],
          page: { mainEntity: { "@id": ORGANIZATION_ID } },
        })}
      />
      <Hero
        title="About BSH"
        subtitle="BSH – Business Smart Hub is your one-stop technology partner, helping physical and digital businesses transform, innovate, and thrive through smart, scalable, and future-ready solutions."
        image="/images/3dlogo.jpeg"
      />

      <About />

      {/* ================= TEAM MEMBER 1 ================= */}
      <OurTeamSection
        id="bilal"
        name="Muhammad Bilal"
        role="Full Stack Developer & SEO Specialist"
        email="bilal@bshsolutions.net"
        about="Bilal is a skilled full stack developer with a strong command of modern web technologies. He also specializes in SEO, helping businesses grow organically through smart optimization strategies."
        image="/team/bilal.jpeg"
        tech={[
          { name: "React", icon: <SiReact /> },
          { name: "Next.js", icon: <SiNextdotjs /> },
          { name: "Node.js", icon: <SiNodedotjs /> },
          { name: "Tailwind", icon: <SiTailwindcss /> },
        ]}
      />

      {/* ================= TEAM MEMBER 2 ================= */}
      <OurTeamSection
        id="shahzaib"
        name="Muhammad Shahzaib"
        role="Website Developer & Digital Marketer"
        email="shahzaib@bshsolutions.net"
        about="Shahzaib builds high-performance websites and creates effective digital marketing strategies that help brands grow faster and stronger. He delivers results with clean designs and smart marketing."
        image="/team/shahzaib.jpeg"
        reverse
        tech={[
          { name: "WordPress", icon: <SiWordpress /> },
          { name: "PHP", icon: <SiPhp /> },
          { name: "Meta", icon: <SiMeta /> },
          { name: "Google Analytics", icon: <SiGoogleanalytics /> },
        ]}
      />

      <Testimonial />
      <ProcessFlow />
      <Faq schema={false} />
      <Contactform />
    </>
  );
};

export default page;

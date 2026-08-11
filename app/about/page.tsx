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

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Meet BSH Solutions — Business Smart Hub. Learn about our team and mission to deliver smart, scalable digital, software, and IT solutions for growing businesses.",
  keywords: [
    "About BSH Solutions",
    "Business Smart Hub team",
    "IT company Pakistan",
    "software development team",
  ],
  alternates: { canonical: "https://bshsolutionss.com/about" },
  openGraph: {
    title: "About BSH Solutions",
    description:
      "Meet the team behind BSH Solutions and our mission to build smart, scalable, future-ready digital solutions.",
    url: "https://bshsolutionss.com/about",
  },
};

const page = () => {
  return (
    <>
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
        about="Bilal is a skilled full stack developer with a strong command of modern web technologies. He also specializes in SEO, helping businesses grow organically through smart optimization strategies."
        image="/team/bilal.jpeg"
        cvLink="/cv/muhammad-bilal.pdf"
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
        about="Shahzaib builds high-performance websites and creates effective digital marketing strategies that help brands grow faster and stronger. He delivers results with clean designs and smart marketing."
        image="/team/shahzaib.jpeg"
        reverse
        cvLink="/cv/muhammad-shahzaib.pdf"
        tech={[
          { name: "WordPress", icon: <SiWordpress /> },
          { name: "PHP", icon: <SiPhp /> },
          { name: "Meta", icon: <SiMeta /> },
          { name: "Google Analytics", icon: <SiGoogleanalytics /> },
        ]}
      />

      <Testimonial />
      <ProcessFlow />
      <Faq />
      <Contactform />
    </>
  );
};

export default page;

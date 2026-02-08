"use client";

import Hero from "@/components/services/Hero";
import About from "@/components/about";
import ProcessFlow from "@/components/ProcessFlow";
import Faq from "@/components/faq";
import Contactform from "@/components/contactform";
import OurTeamSection from "@/components/Ourteam";

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

      <ProcessFlow />
      <Faq />
      <Contactform />
    </>
  );
};

export default page;

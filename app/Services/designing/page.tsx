import type { Metadata } from "next";
import Hero from "@/components/services/Hero";
import Testimonial from "@/components/testimonial";
import ServiceSection from "@/components/services/ServiceSection";
import Form from "@/components/services/Form";
import FaqAccordion from "@/components/services/detail/FaqAccordion";
import { getCategoryFaqs } from "@/lib/services-data";

// 🎨 React Icons Imports
import {
  SiAdobe,
  SiFigma,
  SiCanva,
  SiAdobexd,
  SiSketch,
  SiInvision,
  SiBlender,
  SiCinema4D,
} from "react-icons/si";
import { FaBoxOpen } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Creative Design Services",
  description:
    "BSH Solutions transforms your vision into visually stunning designs — branding, UI/UX, and creative design that inspires, engages, and connects with your audience.",
  keywords: [
    "creative design services",
    "branding agency",
    "UI/UX design",
    "graphic design services",
  ],
  alternates: { canonical: "https://bshsolutionss.com/Services/designing" },
  openGraph: {
    title: "Creative Design Services | BSH Solutions",
    description:
      "Branding, UI/UX, and creative design that inspires, engages, and connects with your audience.",
    url: "https://bshsolutionss.com/Services/designing",
  },
};

export default function DesigningPage() {
  return (
    <>
      <Hero
        title="Creative Design Services"
        subtitle="We transform your vision into visually stunning designs that inspire, engage, and connect with your audience."
        image="/images/Designing.png"
      />

      <section className="text-center py-16">
        <h2 className="text-4xl font-bold">Our Design Expertise</h2>
      </section>

      {/* ===== 1. Branding ===== */}
      <ServiceSection
        id="branding"
        learnMoreHref="/Services/designing/brand-identity-design"
        title="Branding"
        description="We create cohesive brand identities that reflect your business values, build trust, and make a lasting impression."
        features={[
          "Logo & color palette creation",
          "Typography and brand guidelines",
          "Brand storytelling and strategy",
          "Consistent visual identity design",
        ]}
        tech={[
          {
            name: "Adobe Illustrator",
            icon: <SiAdobe color="#FF9A00" />,
          },
          {
            name: "Adobe Photoshop",
            icon: <SiAdobe color="#31A8FF" />,
          },
          { name: "Figma", icon: <SiFigma color="#F24E1E" /> },
          { name: "Canva", icon: <SiCanva color="#00C4CC" /> },
        ]}
        image="/images/Designing/1.png"
      />

      {/* ===== 2. UI / UX Design ===== */}
      <ServiceSection
        id="ui-ux"
        learnMoreHref="/Services/designing/ui-ux-design"
        title="UI / UX Design"
        description="We design user interfaces that are intuitive, accessible, and delightful — enhancing usability and conversion rates."
        features={[
          "User research and wireframing",
          "High-fidelity prototyping",
          "Responsive UI layouts",
          "Design system creation",
        ]}
        tech={[
          { name: "Figma", icon: <SiFigma color="#F24E1E" /> },
          { name: "Adobe XD", icon: <SiAdobexd color="#FF61F6" /> },
          { name: "Sketch", icon: <SiSketch color="#F7B500" /> },
          { name: "InVision", icon: <SiInvision color="#FF3366" /> },
        ]}
        image="/images/Designing/2.png"
        reverse
      />

      {/* ===== 3. Graphic Design ===== */}
      <ServiceSection
        id="graphic-design"
        learnMoreHref="/Services/designing/graphic-design"
        title="Graphic Design"
        description="Our creative team crafts stunning visuals for digital and print that communicate your message effectively."
        features={[
          "Social media creatives",
          "Brochures and posters",
          "Business cards & stationery",
          "Ad banners and marketing visuals",
        ]}
        tech={[
          { name: "Photoshop", icon: <SiAdobe color="#31A8FF" /> },
          { name: "Illustrator", icon: <SiAdobe color="#FF9A00" /> },
          { name: "CorelDRAW", icon: <SiAdobe color="#00A550" /> },
          { name: "Canva", icon: <SiCanva color="#00C4CC" /> },
        ]}
        image="/images/Designing/3.png"
      />

      {/* ===== 4. Logo Design ===== */}
      <ServiceSection
        id="logo-design"
        learnMoreHref="/Services/designing/logo-design"
        title="Logo Design"
        description="We design unique, memorable logos that capture your brand’s personality and create instant recognition."
        features={[
          "Custom concept creation",
          "Vector-based precision design",
          "Multiple revisions & variations",
          "Brand alignment and scalability",
        ]}
        tech={[
          {
            name: "Adobe Illustrator",
            icon: <SiAdobe color="#FF9A00" />,
          },
          {
            name: "Affinity Designer",
            icon: <SiAdobe color="#7E4DD2" />,
          },
          { name: "Figma", icon: <SiFigma color="#F24E1E" /> },
          { name: "Canva", icon: <SiCanva color="#00C4CC" /> },
        ]}
        image="/images/Designing/4.png"
        reverse
      />

      {/* ===== 5. Motion Graphics ===== */}
      <ServiceSection
        id="motion-graphics"
        learnMoreHref="/Services/designing/motion-graphics-design"
        title="Motion Graphics"
        description="We bring your ideas to life with smooth, engaging motion visuals — perfect for ads, explainers, and branding videos."
        features={[
          "Animated logos and intros",
          "Explainer videos",
          "Social media animations",
          "Cinematic transitions & effects",
        ]}
        tech={[
          {
            name: "After Effects",
            icon: <SiAdobe color="#9999FF" />,
          },
          {
            name: "Premiere Pro",
            icon: <SiAdobe color="#9999FF" />,
          },
          { name: "Blender", icon: <SiBlender color="#F5792A" /> },
          { name: "Cinema 4D", icon: <SiCinema4D color="#011A6A" /> },
        ]}
        image="/images/Designing/5.png"
      />

      {/* ===== 6. Packaging Design ===== */}
      <ServiceSection
        id="packaging-design"
        learnMoreHref="/Services/designing/packaging-design"
        title="Packaging Design"
        description="We design professional product packaging that stands out on shelves and tells your brand story at first glance."
        features={[
          "Custom dieline design",
          "Print-ready artwork",
          "3D mockups & product visualization",
          "Material and color guidance",
        ]}
        tech={[
          {
            name: "Adobe Illustrator",
            icon: <SiAdobe color="#FF9A00" />,
          },
          {
            name: "Adobe Photoshop",
            icon: <SiAdobe color="#31A8FF" />,
          },
          { name: "Blender", icon: <SiBlender color="#F5792A" /> },
          { name: "3D Mockup", icon: <FaBoxOpen color="#00AEEF" /> },
        ]}
        image="/images/Designing/6.png"
        reverse
      />

      <FaqAccordion serviceName="Creative Design" faqs={getCategoryFaqs("designing")} />
      <Testimonial />
      <section id="designing-form">
        <Form serviceName="Designing" />
      </section>
    </>
  );
}

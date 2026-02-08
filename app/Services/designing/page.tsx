"use client";
import Hero from "@/components/services/Hero";
import ServiceSection from "@/components/services/ServiceSection";
import Form from "@/components/services/Form";

// 🎨 React Icons Imports
import {
  SiAdobeillustrator,
  SiAdobephotoshop,
  SiFigma,
  SiCanva,
  SiAdobexd,
  SiSketch,
  SiInvision,
  SiCoreldraw,
  SiAffinitydesigner,
  SiAdobepremierepro,
  SiAdobeaftereffects,
  SiBlender,
  SiCinema4D,
} from "react-icons/si";
import { FaBoxOpen } from "react-icons/fa";

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
            icon: <SiAdobeillustrator color="#FF9A00" />,
          },
          {
            name: "Adobe Photoshop",
            icon: <SiAdobephotoshop color="#31A8FF" />,
          },
          { name: "Figma", icon: <SiFigma color="#F24E1E" /> },
          { name: "Canva", icon: <SiCanva color="#00C4CC" /> },
        ]}
        image="/images/Designing/1.png"
      />

      {/* ===== 2. UI / UX Design ===== */}
      <ServiceSection
        id="ui-ux-design"
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
        title="Graphic Design"
        description="Our creative team crafts stunning visuals for digital and print that communicate your message effectively."
        features={[
          "Social media creatives",
          "Brochures and posters",
          "Business cards & stationery",
          "Ad banners and marketing visuals",
        ]}
        tech={[
          { name: "Photoshop", icon: <SiAdobephotoshop color="#31A8FF" /> },
          { name: "Illustrator", icon: <SiAdobeillustrator color="#FF9A00" /> },
          { name: "CorelDRAW", icon: <SiCoreldraw color="#00A550" /> },
          { name: "Canva", icon: <SiCanva color="#00C4CC" /> },
        ]}
        image="/images/Designing/3.png"
      />

      {/* ===== 4. Logo Design ===== */}
      <ServiceSection
        id="logo-design"
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
            icon: <SiAdobeillustrator color="#FF9A00" />,
          },
          {
            name: "Affinity Designer",
            icon: <SiAffinitydesigner color="#7E4DD2" />,
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
            icon: <SiAdobeaftereffects color="#9999FF" />,
          },
          {
            name: "Premiere Pro",
            icon: <SiAdobepremierepro color="#9999FF" />,
          },
          { name: "Blender", icon: <SiBlender color="#F5792A" /> },
          { name: "Cinema 4D", icon: <SiCinema4D color="#011A6A" /> },
        ]}
        image="/images/Designing/5.png"
      />

      {/* ===== 6. Packaging Design ===== */}
      <ServiceSection
        id="packaging-design"
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
            icon: <SiAdobeillustrator color="#FF9A00" />,
          },
          {
            name: "Adobe Photoshop",
            icon: <SiAdobephotoshop color="#31A8FF" />,
          },
          { name: "Blender", icon: <SiBlender color="#F5792A" /> },
          { name: "3D Mockup", icon: <FaBoxOpen color="#00AEEF" /> },
        ]}
        image="/images/Designing/6.png"
        reverse
      />

      <section id="designing-form">
        <Form serviceName="Designing" />
      </section>
    </>
  );
}

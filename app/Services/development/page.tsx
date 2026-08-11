"use client";
import Hero from "@/components/services/Hero";
import Testimonial from "@/components/testimonial";
import ServiceSection from "@/components/services/ServiceSection";
import Form from "@/components/services/Form";

import {
  SiJavascript,
  SiNextdotjs,
  SiReact,
  SiTailwindcss,
  SiThreedotjs,
  SiAngular,
  SiPhp,
  SiShopify,
  SiWordpress,
  SiWoocommerce,
  SiStripe,
  SiPaypal,
  SiFlutter,
  SiApple,
  SiAndroid,
  SiNodedotjs,
  SiPython,
  SiDotnet,
  SiSupabase,
  SiFirebase,
  SiPrisma,
  SiGithub,
  SiDocker,
} from "react-icons/si";

import { FaJava, FaAws, FaTools } from "react-icons/fa";

export default function DevelopmentPage() {
  return (
    <>
      <Hero
        title="Web Development Services"
        subtitle="We craft fast, scalable, and beautiful web experiences tailored to your business."
        image="/images/Development.png"
      />

      <section className="text-center py-16">
        <h2 className="text-4xl font-bold">Our Development Services</h2>
      </section>

      {/* ===== 1. Website Development ===== */}
      <ServiceSection
        id="website-development"
        title="Website Development"
        description="We build responsive, SEO-friendly, and visually appealing websites that elevate your online presence."
        features={[
          "Fast and secure performance",
          "Custom UI/UX design",
          "SEO optimized structure",
          "Fully responsive layouts",
        ]}
        tech={[
          { name: "JavaScript", icon: <SiJavascript color="#F7DF1E" /> },
          { name: "Next.js", icon: <SiNextdotjs color="#000" /> },
          { name: "React", icon: <SiReact color="#61DBFB" /> },
          { name: "Tailwind CSS", icon: <SiTailwindcss color="#38BDF8" /> },
          { name: "Three.js", icon: <SiThreedotjs color="#FFFFFF" /> },
          { name: "Angular", icon: <SiAngular color="#DD0031" /> },
          { name: "PHP", icon: <SiPhp color="#777BB4" /> },
        ]}
        image="/images/development/1.png"
      />

      {/* ===== 2. E-commerce Development ===== */}
      <ServiceSection
        id="e-commerce"
        title="E-Commerce Development"
        description="Launch your custom online store with secure payment gateways and effortless management."
        features={[
          "Custom product management",
          "Secure payment integration",
          "Fast checkout process",
          "Scalable and SEO-ready store",
        ]}
        tech={[
          { name: "Shopify", icon: <SiShopify color="#96BF48" /> },
          { name: "WordPress", icon: <SiWordpress color="#21759B" /> },
          { name: "WooCommerce", icon: <SiWoocommerce color="#96588A" /> },
          { name: "Stripe", icon: <SiStripe color="#635BFF" /> },
          { name: "PayPal", icon: <SiPaypal color="#00457C" /> },
        ]}
        image="/images/development/2.png"
        reverse
      />

      {/* ===== 3. Mobile App Development ===== */}
      <ServiceSection
        id="mobile-apps"
        title="Mobile App Development"
        description="We design and build high-performance mobile apps that deliver seamless experiences across all devices."
        features={[
          "Cross-platform support",
          "Intuitive UI/UX design",
          "App Store & Play Store deployment",
          "Backend integration",
        ]}
        tech={[
          { name: "React Native", icon: <SiReact color="#61DBFB" /> },
          { name: "Flutter", icon: <SiFlutter color="#02569B" /> },
          { name: "iOS", icon: <SiApple color="#A2AAAD" /> },
          { name: "Android", icon: <SiAndroid color="#3DDC84" /> },
        ]}
        image="/images/development/3.png"
      />

      {/* ===== 4. Custom Software Development ===== */}
      <ServiceSection
        id="custom-software"
        title="Custom Software Development"
        description="Tailored business software to automate your workflows, boost efficiency, and reduce costs."
        features={[
          "End-to-end development",
          "Custom APIs and dashboards",
          "Cloud integration",
          "Scalable architecture",
        ]}
        tech={[
          { name: "Node.js", icon: <SiNodedotjs color="#339933" /> },
          { name: "Python", icon: <SiPython color="#3776AB" /> },
          { name: "Java", icon: <FaJava color="#007396" /> },
          { name: ".NET", icon: <SiDotnet color="#512BD4" /> },
        ]}
        image="/images/development/4.png"
        reverse
      />

      {/* ===== 5. Web Applications ===== */}
      <ServiceSection
        id="web-applications"
        title="Web Applications"
        description="Interactive, API-driven web apps built with cutting-edge technology to deliver exceptional performance."
        features={[
          "Real-time functionality",
          "API integrations",
          "Database optimization",
          "Cross-browser compatibility",
        ]}
        tech={[
          { name: "Next.js", icon: <SiNextdotjs color="#000" /> },
          { name: "Supabase", icon: <SiSupabase color="#3ECF8E" /> },
          { name: "Firebase", icon: <SiFirebase color="#FFCA28" /> },
          { name: "Prisma", icon: <SiPrisma color="#2D3748" /> },
        ]}
        image="/images/development/5.png"
      />

      {/* ===== 6. Maintenance & Support ===== */}
      <ServiceSection
        id="maintenance-support"
        title="Maintenance & Support"
        description="We ensure your systems stay updated, secure, and running at top performance round the clock."
        features={[
          "24/7 monitoring",
          "Regular updates",
          "Security patches",
          "Performance audits",
        ]}
        tech={[
          { name: "GitHub", icon: <SiGithub color="#000" /> },
          { name: "Docker", icon: <SiDocker color="#2496ED" /> },
          { name: "AWS", icon: <FaAws color="#FF9900" /> },
          { name: "CI/CD", icon: <FaTools color="#E24329" /> },
        ]}
        image="/images/development/6.png"
        reverse
      />
      <Testimonial />
      <section id="development-form">
        <Form serviceName="Development" />
      </section>
    </>
  );
}

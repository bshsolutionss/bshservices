import type { Metadata } from "next";

import Hero from "@/components/services/Hero";
import Testimonial from "@/components/testimonial";
import ServiceSection from "@/components/services/ServiceSection";
import Form from "@/components/services/Form";

// ==== ICONS ====
import {
  FaCamera,
  FaVideo,
  FaPhotoVideo,
  FaMicrophoneAlt,
} from "react-icons/fa";
import { MdOutlineColorLens } from "react-icons/md";
import {
  SiAdobe,
  SiDavinciresolve,
  SiCanva,
} from "react-icons/si";
import { TbDrone, TbCameraSelfie } from "react-icons/tb";

export const metadata: Metadata = {
  title: "Photography & Videography Services",
  description:
    "BSH Solutions captures moments, products, and stories with a blend of creativity, precision, and professional artistry — product photography, brand shoots, and video.",
  keywords: [
    "photography services",
    "videography services",
    "product photography",
    "brand shoots",
  ],
  alternates: { canonical: "https://bshsolutionss.com/Services/photography" },
  openGraph: {
    title: "Photography & Videography Services | BSH Solutions",
    description:
      "We capture moments, products, and stories with creativity, precision, and professional artistry.",
    url: "https://bshsolutionss.com/Services/photography",
  },
};

export default function PhotographyPage() {
  return (
    <>
      <Hero
        title="Photography & Videography Services"
        subtitle="We capture moments, products, and stories with a perfect blend of creativity, precision, and professional artistry."
        image="/images/Photography.png"
      />

      <section id="photography-expertise" className="text-center py-16">
        <h2 className="text-4xl font-bold">Our Photography Expertise</h2>
      </section>

      {/* ===== 1. Product Photography ===== */}
      <section id="product-photography">
        <ServiceSection
          title="Product Photography"
          description="Showcase your products in their best light with high-quality, detail-oriented photography designed to boost engagement and sales."
          features={[
            "E-commerce and catalog photography",
            "Studio and lifestyle setups",
            "Lighting and composition perfection",
            "High-resolution product retouching",
          ]}
          tech={[
            { name: "Camera", icon: <FaCamera color="#222" /> },
            { name: "Lightroom", icon: <SiAdobe color="#31A8FF" /> },
            { name: "Photoshop", icon: <SiAdobe color="#31A8FF" /> },
            { name: "Canva", icon: <SiCanva color="#00C4CC" /> },
          ]}
          image="/images/Photography/1.png"
        />
      </section>

      {/* ===== 2. Brand Shoots ===== */}
      <section id="brand-shoots">
        <ServiceSection
          title="Brand Shoots"
          description="We help brands visually communicate their story through conceptual photography that connects emotionally with their audience."
          features={[
            "Creative direction and planning",
            "On-location or studio sessions",
            "Professional lighting setup",
            "Consistent visual branding",
          ]}
          tech={[
            { name: "Camera Setup", icon: <FaPhotoVideo color="#111" /> },
            {
              name: "Tripod & Lighting",
              icon: <TbCameraSelfie color="#666" />,
            },
            { name: "Photoshop", icon: <SiAdobe color="#31A8FF" /> },
            { name: "Lightroom", icon: <SiAdobe color="#31A8FF" /> },
          ]}
          image="/images/Photography/2.png"
          reverse
        />
      </section>

      {/* ===== 3. Event Coverage ===== */}
      <section id="event-coverage">
        <ServiceSection
          title="Event Coverage"
          description="From corporate events to personal celebrations, we capture every key moment with a creative and journalistic eye."
          features={[
            "Professional event photography team",
            "Multi-angle coverage",
            "Instant on-site editing support",
            "Photo and video package options",
          ]}
          tech={[
            { name: "Camera", icon: <FaCamera color="#333" /> },
            { name: "Microphone", icon: <FaMicrophoneAlt color="#999" /> },
            {
              name: "Premiere Pro",
              icon: <SiAdobe color="#9999FF" />,
            },
            {
              name: "DaVinci Resolve",
              icon: <SiDavinciresolve color="#223FFF" />,
            },
          ]}
          image="/images/Photography/3.png"
        />
      </section>

      {/* ===== 4. Video Production ===== */}
      <section id="video-production">
        <ServiceSection
          title="Video Production"
          description="Full-scale video production services — from concept to final edit — delivering cinematic visuals that tell powerful stories."
          features={[
            "Concept, scripting, and storyboarding",
            "4K filming and direction",
            "Professional color grading",
            "Sound design and motion graphics",
          ]}
          tech={[
            { name: "Filming", icon: <FaVideo color="#000" /> },
            {
              name: "Premiere Pro",
              icon: <SiAdobe color="#9999FF" />,
            },
            {
              name: "After Effects",
              icon: <SiAdobe color="#D291FF" />,
            },
            {
              name: "DaVinci Resolve",
              icon: <SiDavinciresolve color="#223FFF" />,
            },
          ]}
          image="/images/Photography/4.png"
          reverse
        />
      </section>

      {/* ===== 5. Editing & Retouching ===== */}
      <section id="editing-retouching">
        <ServiceSection
          title="Editing & Retouching"
          description="Bring every shot to perfection with expert color correction, compositing, and digital retouching that enhances natural beauty."
          features={[
            "High-end retouching",
            "Color grading and tone balance",
            "Image compositing and cleanup",
            "Batch export for web & print",
          ]}
          tech={[
            { name: "Photoshop", icon: <SiAdobe color="#31A8FF" /> },
            { name: "Lightroom", icon: <SiAdobe color="#31A8FF" /> },
            {
              name: "After Effects",
              icon: <SiAdobe color="#D291FF" />,
            },
            {
              name: "Color Tools",
              icon: <MdOutlineColorLens color="#F5B041" />,
            },
          ]}
          image="/images/Photography/5.png"
        />
      </section>

      {/* ===== 6. Drone Photography ===== */}
      <section id="drone-photography">
        <ServiceSection
          title="Drone Photography"
          description="Aerial imagery that adds cinematic perspectives to your visuals — perfect for real estate, events, and creative brand films."
          features={[
            "4K aerial photo and video",
            "Licensed drone operators",
            "Dynamic FPV shots",
            "Post-production editing and color work",
          ]}
          tech={[
            { name: "Drone", icon: <TbDrone color="#111" /> },
            { name: "Camera", icon: <FaCamera color="#444" /> },
            {
              name: "Premiere Pro",
              icon: <SiAdobe color="#9999FF" />,
            },
            {
              name: "DaVinci Resolve",
              icon: <SiDavinciresolve color="#223FFF" />,
            },
          ]}
          image="/images/Photography/6.png"
          reverse
        />
      </section>

      <Testimonial />
      <section id="photography-form">
        <Form serviceName="Photography" />
      </section>
    </>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import {
  Monitor,
  ShoppingCart,
  Smartphone,
  Cpu,
  ChartBar,
  SlidersHorizontal,
  Paintbrush,
  Palette,
  PenTool,
  Video,
  DollarSign,
  Users,
  Megaphone,
  Camera,
  ImageIcon,
  CameraIcon,
  Aperture,
  MessageSquare,
} from "lucide-react";
import "./movingtext.css";
const services = [
  {
    id: "ai",
    title: "AI Services",
    category: "ai",
    items: [
      { title: "AI Automation", icon: SlidersHorizontal, slug: "ai-automation" },
      { title: "AI Chatbots", icon: MessageSquare, slug: "ai-chatbots" },
      { title: "AI Website Integration", icon: Monitor, slug: "ai-website-integration" },
      { title: "AI Social Media Automation", icon: Megaphone, slug: "social-media-automation" },
      { title: "AI Video Automation", icon: Video, slug: "ai-video-automation" },
      { title: "AEO", icon: ChartBar, slug: "aeo-ai-enablement" },
    ],
  },
  {
    id: "development",
    title: "Development",
    category: "development",
    items: [
      { title: "Website Development", icon: Monitor, slug: "website-development" },
      { title: "E-commerce", icon: ShoppingCart, slug: "ecommerce-development" },
      { title: "Mobile Apps", icon: Smartphone, slug: "mobile-app-development" },
      { title: "Custom Software", icon: Cpu, slug: "custom-software-development" },
      { title: "Web Applications", icon: ChartBar, slug: "web-application-development" },
      { title: "Maintenance & Support", icon: SlidersHorizontal, slug: "website-maintenance-support" },
    ],
  },
  {
    id: "design",
    title: "Designing",
    category: "designing",
    items: [
      { title: "Branding", icon: Paintbrush, slug: "brand-identity-design" },
      { title: "UI / UX", icon: Monitor, slug: "ui-ux-design" },
      { title: "Graphic Design", icon: Palette, slug: "graphic-design" },
      { title: "Logo Design", icon: PenTool, slug: "logo-design" },
      { title: "Motion Graphics", icon: Video, slug: "motion-graphics-design" },
      { title: "Packaging Design", icon: ChartBar, slug: "packaging-design" },
    ],
  },
  {
    id: "marketing",
    title: "Marketing",
    category: "marketing",
    items: [
      { title: "PPC Advertising", icon: DollarSign, slug: "ppc-advertising" },
      { title: "Social Media Marketing", icon: Users, slug: "social-media-marketing" },
      { title: "SEO Optimization", icon: Megaphone, slug: "seo-optimization" },
      { title: "Email Marketing", icon: ChartBar, slug: "email-marketing" },
      { title: "Content Marketing", icon: PenTool, slug: "content-marketing" },
      { title: "Influencer Marketing", icon: Users, slug: "influencer-marketing" },
    ],
  },
  {
    id: "photography",
    title: "Photography",
    category: "photography",
    items: [
      { title: "Product Photography", icon: Camera, slug: "product-photography" },
      { title: "Brand Shoots", icon: ImageIcon, slug: "brand-shoots" },
      { title: "Event Coverage", icon: CameraIcon, slug: "event-coverage" },
      { title: "Video Production", icon: Video, slug: "video-production" },
      { title: "Editing & Retouching", icon: Aperture, slug: "photo-editing-retouching" },
      { title: "Drone Photography", icon: Camera, slug: "drone-photography" },
    ],
  },
];

const MovingText: React.FC = () => {
  return (
    <section
      id="page2"
      className="relative w-full py-12 overflow-hidden text-[#1A14A5] bg-[#fdfdfd] dark:bg-[#010b1c]"
    >
      {/* Background glow layer */}
      <div className="moving-bg"></div>

      <div className="relative flex flex-col gap-8">
        {services.map((category, idx) => (
          <div
            key={category.id}
            className={`flex items-center gap-8 ${
              idx % 2 === 0 ? "animate-move" : "animate-move-reverse"
            }`}
          >
            {category.items.map((item, i) => {
              const Icon = item.icon;
              // Canonical service detail page (full content, FAQs, schema) —
              // not a heading, and not a category-page anchor.
              const href = `/Services/${category.category}/${item.slug}`;

              return (
                <Link
                  key={i}
                  href={href}
                  className="flex items-center gap-3 bg-white/10 dark:bg-white/5 px-6 py-3 rounded-full shadow-lg
                             hover:scale-105 hover:bg-[#0ef]/10 transition-transform duration-300 cursor-pointer"
                >
                  <Icon className="w-6 h-6 text-[#1A14A5] icon-glow" />
                  <span className="text-[2vw] font-semibold whitespace-nowrap text-[#1A14A5] dark:text-[#0ef]">
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
};

export default MovingText;

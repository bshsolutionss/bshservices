"use client";

import React, { useState, JSX } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Globe,
  BarChart3,
  Brush,
  CameraIcon,
  ShoppingCart,
  Smartphone,
  Cpu,
  Monitor,
  Paintbrush,
  Palette,
  PenTool,
  Megaphone,
  DollarSign,
  Users,
  ChartBar,
  Camera,
  ImageIcon,
  Video,
  SlidersHorizontal,
  Aperture,
} from "lucide-react";
import { MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import Image from "next/image";

type ServiceItem = {
  title: string;
  desc: string;
  icon: React.ElementType;
  /** Canonical slug from lib/services-data.ts — used to link to the real service detail page (with its full content, FAQs, and schema) instead of a category-page anchor. */
  slug: string;
};

type Tab = {
  id: string;
  title: string;
  icon: React.ElementType;
  items: ServiceItem[];
};

const TABS: Tab[] = [
  {
    id: "development",
    title: "Development",
    icon: Globe,
    items: [
      {
        title: "Website Development",
        desc: "Fast, secure, and scalable web solutions.",
        icon: Monitor,
        slug: "website-development",
      },
      {
        title: "E-commerce",
        desc: "Custom online stores with secure payment gateways.",
        icon: ShoppingCart,
        slug: "ecommerce-development",
      },
      {
        title: "Mobile Apps",
        desc: "Cross-platform apps built for performance.",
        icon: Smartphone,
        slug: "mobile-app-development",
      },
      {
        title: "Custom Software",
        desc: "Tailored systems to automate and optimize business.",
        icon: Cpu,
        slug: "custom-software-development",
      },
      {
        title: "Web Applications",
        desc: "Dynamic, API-integrated web apps.",
        icon: ChartBar,
        slug: "web-application-development",
      },
      {
        title: "Maintenance & Support",
        desc: "Ongoing updates, fixes, and technical support.",
        icon: SlidersHorizontal,
        slug: "website-maintenance-support",
      },
    ],
  },
  {
    id: "design",
    title: "Designing",
    icon: Brush,
    items: [
      {
        title: "Branding",
        desc: "Complete visual identity design.",
        icon: Paintbrush,
        slug: "brand-identity-design",
      },
      {
        title: "UI / UX",
        desc: "Designs that delight and convert.",
        icon: Monitor,
        slug: "ui-ux-design",
      },
      {
        title: "Graphic Design",
        desc: "Creative visuals for print and digital.",
        icon: Palette,
        slug: "graphic-design",
      },
      {
        title: "Logo Design",
        desc: "Unique, memorable brand marks.",
        icon: PenTool,
        slug: "logo-design",
      },
      {
        title: "Motion Graphics",
        desc: "Animated visuals and video graphics.",
        icon: Video,
        slug: "motion-graphics-design",
      },
      {
        title: "Packaging Design",
        desc: "Professional product packaging designs.",
        icon: ChartBar,
        slug: "packaging-design",
      },
    ],
  },
  {
    id: "marketing",
    title: "Marketing",
    icon: BarChart3,
    items: [
      {
        title: "PPC Advertising",
        desc: "Targeted paid ad campaigns for high ROI.",
        icon: DollarSign,
        slug: "ppc-advertising",
      },
      {
        title: "Social Media Marketing",
        desc: "Growth through creative social campaigns.",
        icon: Users,
        slug: "social-media-marketing",
      },
      {
        title: "SEO Optimization",
        desc: "Rank higher with data-driven SEO.",
        icon: Megaphone,
        slug: "seo-optimization",
      },
      {
        title: "Email Marketing",
        desc: "Automated and personalized email flows.",
        icon: ChartBar,
        slug: "email-marketing",
      },
      {
        title: "Content Marketing",
        desc: "Engaging blog, video, and media strategies.",
        icon: PenTool,
        slug: "content-marketing",
      },
      {
        title: "Influencer Marketing",
        desc: "Collaborate with trusted voices in your niche.",
        icon: Users,
        slug: "influencer-marketing",
      },
    ],
  },
  {
    id: "photography",
    title: "Photography",
    icon: CameraIcon,
    items: [
      {
        title: "Product Photography",
        desc: "High-quality product visuals for online stores.",
        icon: Camera,
        slug: "product-photography",
      },
      {
        title: "Brand Shoots",
        desc: "Professional shoots that tell your brand’s story.",
        icon: ImageIcon,
        slug: "brand-shoots",
      },
      {
        title: "Event Coverage",
        desc: "Capture events with precision and creativity.",
        icon: CameraIcon,
        slug: "event-coverage",
      },
      {
        title: "Video Production",
        desc: "Full-scale promotional and brand videos.",
        icon: Video,
        slug: "video-production",
      },
      {
        title: "Editing & Retouching",
        desc: "Expert editing for stunning final results.",
        icon: Aperture,
        slug: "photo-editing-retouching",
      },
      {
        title: "Drone Photography",
        desc: "Aerial shots with cinematic quality.",
        icon: Camera,
        slug: "drone-photography",
      },
    ],
  },
  {
    id: "ai",
    title: "AI Services",
    icon: Cpu,
    items: [
      {
        title: "AI Automation",
        desc: "Automate workflows, customer service, and operations using AI.",
        icon: SlidersHorizontal,
        slug: "ai-automation",
      },
      {
        title: "AI Chatbots",
        desc: "24/7 intelligent chatbots for websites, WhatsApp & social media.",
        icon: MessageSquare,
        slug: "ai-chatbots",
      },
      {
        title: "AI Website Integration",
        desc: "Integrate AI search, chatbot, personalization & automation.",
        icon: Monitor,
        slug: "ai-website-integration",
      },
      {
        title: "AI Social Media Automation",
        desc: "AI-driven content creation, scheduling & auto-replies.",
        icon: Megaphone,
        slug: "social-media-automation",
      },
      {
        title: "AI Video Automation",
        desc: "Auto-generated ads, reels & product videos using AI tools.",
        icon: Video,
        slug: "ai-video-automation",
      },
      {
        title: "AEO",
        desc: "AI-powered SEO, content generation & search ranking improvement.",
        icon: BarChart3,
        slug: "aeo-ai-enablement",
      },
    ],
  },
];

/** Tab id → the actual URL path segment under /Services (the "design" tab id predates the "designing" route slug). */
const CATEGORY_PATH: Record<string, string> = {
  development: "development",
  design: "designing",
  marketing: "marketing",
  photography: "photography",
  ai: "ai",
};

interface ServicesProps {
  /**
   * "Our Services" is this section's own heading either way — but which
   * tag it renders as depends on where the section lives. Default "h2"
   * fits its homepage use (the page's own H1 is the Hero above it). Pass
   * "h1" when this section IS the page's primary heading, e.g. on
   * `/Services`, which otherwise has no H1 at all.
   */
  headingLevel?: "h1" | "h2";
}

export default function Services({ headingLevel = "h2" }: ServicesProps): JSX.Element {
  const [active, setActive] = useState<string>(TABS[0].id);
  const activeTab = TABS.find((t) => t.id === active) ?? TABS[0];
  const router = useRouter();
  const Heading = headingLevel;

  const imageMap: Record<string, string> = {
    development: "/images/Development.png",
    design: "/images/Designing.png",
    marketing: "/images/Marketing.png",
    photography: "/images/Photography.png",
    ai: "/images/ai/ai.png",
  };

  return (
    <section
      id="services"
      className="relative py-20 px-6 lg:px-16 bg-[#F4F7FE] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* ====== Section Heading ====== */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Heading className="text-4xl lg:text-5xl font-extrabold text-[#1A14A5] drop-shadow-sm">
            Our <span className="text-[#231F20]">Services</span>
          </Heading>
          <p className="mt-4 text-lg text-[#231F20]/80 max-w-2xl mx-auto">
            Business Smart Hub (BSH) provides future-ready solutions to help
            businesses design, develop, market, and scale in the digital age.
          </p>
        </motion.div>

        {/* ====== Tabs ====== */}
        <div className="mt-10">
          <div
            className="flex gap-3 flex-wrap justify-center"
            role="tablist"
            aria-label="Services tabs"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active === tab.id}
                onClick={() => setActive(tab.id)}
                className={`flex items-center gap-3 px-5 py-3 rounded-2xl focus:outline-none transition-all ${
                  active === tab.id
                    ? "bg-white shadow-lg text-[#1A14A5]"
                    : "bg-white/60 hover:bg-white/90 text-[#231F20]"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-semibold">{tab.title}</span>
              </button>
            ))}
          </div>

          {/* ====== Tab Content ====== */}
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-12 space-y-12"
          >
            {/* ====== Main Service Card ====== */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-3xl shadow-2xl group w-full h-[400px] sm:h-[500px] md:h-[550px] perspective-1000"
            >
              {/* Background Image */}
              <div className="relative w-full h-full transform-gpu group-hover:scale-[1.04] transition-transform duration-700 ease-out">
                <Image
                  src={imageMap[active]}
                  alt={`${activeTab.title} service illustration`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                  className="object-cover"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/60 group-hover:from-black/70 group-hover:via-black/30 group-hover:to-black/70 transition-all duration-500" />

              {/* Centered Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-6 sm:p-10 z-20">
                <div className="flex flex-col items-center gap-3 mb-4 px-8 py-6 rounded-3xl bg-black/10 backdrop-blur-[2px] border border-white/10">
                  <activeTab.icon className="w-12 h-12 text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                  <h3 className="text-white text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">
                    {activeTab.title}
                  </h3>
                </div>

                <p className="text-white/90 mb-8 text-sm sm:text-base md:text-lg max-w-2xl drop-shadow-sm font-medium">
                  Explore our {activeTab.title.toLowerCase()} services and
                  discover how we can bring your vision to life with quality and
                  innovation.
                </p>

                <Button
                  size="lg"
                  className="bg-[#1A14A5] text-white font-semibold hover:bg-black px-8 py-4 rounded-xl transition-all duration-300 w-fit shadow-lg"
                  onClick={() => {
                    if (active === "development")
                      router.push("/Services/development#development-form");
                    else if (active === "design")
                      router.push("/Services/designing#designing-form");
                    else if (active === "marketing")
                      router.push("/Services/marketing#marketing-form");
                    else if (active === "photography")
                      router.push("/Services/photography#photography-form");
                    else if (active === "ai")
                      router.push("/Services/ai#ai-form");
                  }}
                >
                  Get a Quote
                </Button>
              </div>
            </motion.div>

            {/* ====== Sub-Service Grid ====== */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {activeTab.items.map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 flex flex-col justify-between text-center"
                >
                  <div>
                    <item.icon className="w-12 h-12 text-[#1A14A5] mb-4 mx-auto" />
                    <h4 className="text-xl font-semibold text-[#231F20] mb-2">
                      {item.title}
                    </h4>
                    <p className="text-sm text-[#231F20]/75 mb-6">
                      {item.desc}
                    </p>
                  </div>

                  {/* Learn More Button → the service's own canonical detail page (full content, FAQs, and schema), not a category-page anchor */}
                  <Button
                    onClick={() => {
                      const categoryPath = CATEGORY_PATH[active] ?? active;
                      router.push(`/Services/${categoryPath}/${item.slug}`);
                    }}
                    className="mt-auto bg-[#1A14A5] text-white hover:bg-[#0e0a7a] px-6 py-3 rounded-xl font-medium mx-auto transition-all"
                  >
                    Learn More
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ====== CTA Section ====== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mt-12 text-center"
        >
          <h3 className="text-2xl lg:text-3xl font-semibold text-[#231F20] mb-4">
            Let’s Work Together 🚀
          </h3>
          <Button
            size="lg"
            className="bg-[#1A14A5] hover:bg-[#0e0a7a] text-white px-10 py-6 text-lg rounded-2xl shadow-lg hover:shadow-xl transition"
            onClick={() => router.push("/contact")}
          >
            Contact Us
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

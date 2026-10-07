"use client";

import React, { useCallback, useEffect, useRef, useState, type JSX } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type ServiceItem = {
  title: string;
  /** Two-line pitch shown under the image when this service is selected. */
  desc: string;
  /** Canonical slug from lib/services-data.ts — links to the real service detail page. */
  slug: string;
  image: string;
};

type Tab = {
  id: string;
  title: string;
  /** URL segment under /Services (the "design" tab id predates the "designing" route). */
  path: string;
  items: ServiceItem[];
};

const TABS: Tab[] = [
  {
    id: "development",
    title: "Development",
    path: "development",
    items: [
      {
        title: "Website Development",
        slug: "website-development",
        image: "/images/development/1.png",
        desc: "Fast, secure and scalable websites built around your goals, designed to load quickly, rank well and convert visitors into customers.",
      },
      {
        title: "E-commerce",
        slug: "ecommerce-development",
        image: "/images/development/2.png",
        desc: "Custom online stores with secure payment gateways, smooth checkout and inventory tools that help you sell more, everywhere.",
      },
      {
        title: "Mobile Apps",
        slug: "mobile-app-development",
        image: "/images/development/3.png",
        desc: "Cross-platform mobile apps for iOS and Android, built for performance, reliability and an experience your users keep coming back to.",
      },
      {
        title: "Custom Software",
        slug: "custom-software-development",
        image: "/images/development/4.png",
        desc: "Tailored systems that automate manual work, connect your tools and give your team the software your business actually needs.",
      },
      {
        title: "Web Applications",
        slug: "web-application-development",
        image: "/images/development/5.png",
        desc: "Dynamic, API-integrated web applications and dashboards that stay fast and secure as your users and data grow.",
      },
      {
        title: "Maintenance & Support",
        slug: "website-maintenance-support",
        image: "/images/development/6.png",
        desc: "Ongoing updates, security patches, backups and technical support so your website stays fast, safe and always online.",
      },
    ],
  },
  {
    id: "design",
    title: "Designing",
    path: "designing",
    items: [
      {
        title: "Branding",
        slug: "brand-identity-design",
        image: "/images/Designing/1.png",
        desc: "A complete visual identity (logo, colours, typography and guidelines) that makes your business recognisable and trusted.",
      },
      {
        title: "UI / UX",
        slug: "ui-ux-design",
        image: "/images/Designing/2.png",
        desc: "Research-led interface and experience design that feels effortless to use and turns more visitors into customers.",
      },
      {
        title: "Graphic Design",
        slug: "graphic-design",
        image: "/images/Designing/3.png",
        desc: "Creative visuals for print and digital, from social posts and brochures to presentations that keep your brand consistent.",
      },
      {
        title: "Logo Design",
        slug: "logo-design",
        image: "/images/Designing/4.png",
        desc: "Unique, memorable logo marks crafted to work everywhere, from a favicon to a storefront sign.",
      },
      {
        title: "Motion Graphics",
        slug: "motion-graphics-design",
        image: "/images/Designing/5.png",
        desc: "Animated visuals, explainers and video graphics that explain ideas quickly and hold attention on every platform.",
      },
      {
        title: "Packaging Design",
        slug: "packaging-design",
        image: "/images/Designing/6.png",
        desc: "Professional product packaging that stands out on the shelf, protects what is inside and tells your brand story.",
      },
    ],
  },
  {
    id: "marketing",
    title: "Marketing",
    path: "marketing",
    items: [
      {
        title: "PPC Advertising",
        slug: "ppc-advertising",
        image: "/images/Marketing/1.png",
        desc: "Targeted paid campaigns on Google and social platforms, optimised continuously for qualified leads and a high return on spend.",
      },
      {
        title: "Social Media Marketing",
        slug: "social-media-marketing",
        image: "/images/Marketing/2.png",
        desc: "Creative, consistent social campaigns that grow your audience, build community and drive real enquiries.",
      },
      {
        title: "SEO Optimization",
        slug: "seo-optimization",
        image: "/images/Marketing/3.png",
        desc: "Data-driven technical, on-page and content SEO that helps you rank higher and earn steady organic traffic.",
      },
      {
        title: "Email Marketing",
        slug: "email-marketing",
        image: "/images/Marketing/4.png",
        desc: "Automated, personalised email flows and campaigns that nurture leads and bring customers back.",
      },
      {
        title: "Content Marketing",
        slug: "content-marketing",
        image: "/images/Marketing/5.png",
        desc: "Engaging blog, video and media strategies that build authority and attract the customers you want.",
      },
      {
        title: "Influencer Marketing",
        slug: "influencer-marketing",
        image: "/images/Marketing/6.png",
        desc: "Collaborations with trusted voices in your niche to reach new audiences with credibility.",
      },
    ],
  },
  {
    id: "photography",
    title: "Photography",
    path: "photography",
    items: [
      {
        title: "Product Photography",
        slug: "product-photography",
        image: "/images/Photography/1.png",
        desc: "High-quality, consistent product visuals for online stores and catalogues that make buyers click “add to cart”.",
      },
      {
        title: "Brand Shoots",
        slug: "brand-shoots",
        image: "/images/Photography/2.png",
        desc: "Professional shoots that tell your brand’s story through people, places and products.",
      },
      {
        title: "Event Coverage",
        slug: "event-coverage",
        image: "/images/Photography/3.png",
        desc: "Photo and video coverage that captures the moments that matter, with precision and creativity.",
      },
      {
        title: "Video Production",
        slug: "video-production",
        image: "/images/Photography/4.png",
        desc: "Full-scale promotional, brand and product videos from concept and shooting to final edit.",
      },
      {
        title: "Editing & Retouching",
        slug: "photo-editing-retouching",
        image: "/images/Photography/5.png",
        desc: "Expert colour correction, retouching and editing that turn good shots into stunning final results.",
      },
      {
        title: "Drone Photography",
        slug: "drone-photography",
        image: "/images/Photography/6.png",
        desc: "Cinematic aerial photos and video that show your property, project or event from a new angle.",
      },
    ],
  },
  {
    id: "ai",
    title: "AI Services",
    path: "ai",
    items: [
      {
        title: "AI Automation",
        slug: "ai-automation",
        image: "/images/ai/1.png",
        desc: "Automate workflows, customer service and operations with AI agents that give your team back real time.",
      },
      {
        title: "AI Chatbots",
        slug: "ai-chatbots",
        image: "/images/ai/3.png",
        desc: "24/7 intelligent chatbots for your website, WhatsApp and social media that answer, qualify and book.",
      },
      {
        title: "AI Website Integration",
        slug: "ai-website-integration",
        image: "/images/ai/4.png",
        desc: "Add AI search, chat, personalisation and automation to your website without rebuilding it.",
      },
      {
        title: "AI Social Media Automation",
        slug: "social-media-automation",
        image: "/images/ai/2.png",
        desc: "AI-driven content creation, scheduling and auto-replies that keep your social channels active.",
      },
      {
        title: "AI Video Automation",
        slug: "ai-video-automation",
        image: "/images/ai/6.png",
        desc: "Auto-generated ads, reels and product videos made with AI tools, at a fraction of the usual time.",
      },
      {
        title: "AEO",
        slug: "aeo-ai-enablement",
        image: "/images/ai/5.png",
        desc: "Answer-engine optimisation so your business is the one AI assistants and search engines recommend.",
      },
    ],
  },
];

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
  const [tabIndex, setTabIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const mounted = useRef(false);
  const Heading = headingLevel;

  const tab = TABS[tabIndex];
  const item = tab.items[itemIndex];

  const selectTab = useCallback((i: number) => {
    setTabIndex(i);
    setItemIndex(0);
  }, []);

  // Centre the active tab / service chip inside their horizontally scrolling
  // rows. Scrolls the row itself (never the page — scrollIntoView could drag
  // the whole page down to this section on load) and skips the first render.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const centre = (row: HTMLElement | null, i: number) => {
      const el = row?.children[i] as HTMLElement | undefined;
      if (!row || !el || row.scrollWidth <= row.clientWidth + 4) return;
      row.scrollTo({ left: el.offsetLeft - (row.clientWidth - el.clientWidth) / 2, behavior: "smooth" });
    };
    centre(tabsRef.current, tabIndex);
    centre(listRef.current, itemIndex);
  }, [tabIndex, itemIndex]);

  // Arrow: scroll the bar if it overflows, otherwise step to the next category.
  const onNext = () => {
    const el = tabsRef.current;
    if (el && el.scrollWidth > el.clientWidth + 4 && el.scrollLeft + el.clientWidth < el.scrollWidth - 4) {
      el.scrollBy({ left: 220, behavior: "smooth" });
    } else {
      selectTab((tabIndex + 1) % TABS.length);
    }
  };

  return (
    <section id="services" className="relative bg-[#F4F7FE] px-4 py-16 sm:px-6 lg:px-16 lg:py-20">
      <div className="mx-auto max-w-7xl">
        {/* ====== Heading ====== */}
        <Heading className="max-w-xl text-3xl font-bold leading-[1.15] tracking-tight text-[#231F20] sm:text-4xl lg:text-5xl">
          Our services to help you unlock new possibilities
        </Heading>

        {/* ====== Tab bar ====== */}
        <div className="mt-8 flex items-center rounded-full border border-[#231F20]/20 bg-white/60 p-1 sm:p-1.5 lg:mt-12">
          <div
            ref={tabsRef}
            role="tablist"
            aria-label="Service categories"
            className="relative flex flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] md:justify-between md:gap-2 [&::-webkit-scrollbar]:hidden"
          >
            {TABS.map((t, i) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={i === tabIndex}
                onClick={() => selectTab(i)}
                className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A14A5] sm:px-6 sm:py-3 sm:text-base ${
                  i === tabIndex
                    ? "font-bold text-[#231F20]"
                    : "font-medium text-[#231F20]/65 hover:text-[#1A14A5]"
                }`}
              >
                {t.title}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label="Next category"
            onClick={onNext}
            className="ml-1.5 grid h-10 w-10 shrink-0 sm:ml-2 sm:h-11 sm:w-11 place-items-center rounded-full border border-[#231F20]/20 bg-white text-[#231F20] transition-colors hover:border-[#1A14A5] hover:text-[#1A14A5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A14A5]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* ====== Content card ====== */}
        <div className="mt-5 rounded-3xl border border-[#231F20]/15 bg-gradient-to-tr from-[#D5D3F5] via-[#EDEEFB] to-[#F6F7FD] p-4 sm:mt-6 sm:rounded-[2rem] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.6fr)] lg:gap-10">
            {/* ---- Left: service list ---- */}
            <ul
              ref={listRef}
              className="relative -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:p-0 [&::-webkit-scrollbar]:hidden"
              aria-label={`${tab.title} services`}
            >
              {tab.items.map((it, i) => {
                const selected = i === itemIndex;
                return (
                  <li key={it.slug} className="shrink-0 lg:shrink">
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setItemIndex(i)}
                      className={`flex items-center gap-3 whitespace-nowrap rounded-full px-4 py-2.5 text-left text-sm font-medium text-[#231F20] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#231F20] lg:w-full lg:justify-between lg:px-5 lg:py-3.5 lg:text-[15px] ${
                        selected
                          ? "bg-white shadow-md"
                          : "border border-[#1A14A5]/10 bg-white/40 hover:bg-white/70 lg:border-transparent lg:bg-transparent lg:hover:bg-white/50"
                      }`}
                    >
                      {it.title}
                      <ChevronRight className="hidden h-4 w-4 shrink-0 lg:block" />
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* ---- Right: image + description ---- */}
            <div>
              {/* The illustrations are 3:2 (AI ones 1:1): show them whole (contain) over a
                  blurred copy of themselves so any side space blends in — no cropping. */}
              <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-[#DAD7F3] sm:aspect-[16/10] lg:aspect-auto lg:h-[440px]">
                <Image
                  key={`bg-${item.image}`}
                  src={item.image}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="64px"
                  className="scale-110 object-cover opacity-50 blur-2xl"
                />
                <Image
                  key={item.image}
                  src={item.image}
                  alt={`${item.title} service`}
                  fill
                  priority={tabIndex === 0 && itemIndex === 0}
                  sizes="(max-width: 1024px) 100vw, 760px"
                  className="animate-in fade-in object-contain duration-500"
                />
              </div>

              <p
                key={item.slug}
                className="animate-in fade-in mt-4 min-h-[3.5rem] max-w-4xl text-[15px] leading-relaxed text-[#231F20] duration-500 sm:mt-5 sm:text-base"
              >
                {item.desc}
              </p>

              <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
                <Link
                  href={`/Services/${tab.path}/${item.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1A14A5] hover:underline"
                >
                  Learn more about {item.title}
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/Services/${tab.path}#${tab.path}-form`}
                  className="rounded-full border border-[#231F20]/30 bg-white px-5 py-2 text-sm font-semibold text-[#231F20] transition-colors hover:border-[#1A14A5] hover:text-[#1A14A5]"
                >
                  Get a quote
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

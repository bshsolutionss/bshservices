/**
 * Hand-written <title> and meta description for every sub-service page,
 * keyed by service slug (lib/services-data.ts). Titles stay ≤ 60 chars with
 * the brand, descriptions 140–160 chars, each led by the search phrase the
 * page targets. lib/services-page-factory.ts falls back to the generated
 * values for any slug missing here.
 */
export const SERVICE_SEO: Record<string, { title: string; description: string }> = {
  // ── Development ──
  "website-development": {
    title: "Website Development Services | BSH Solutions",
    description:
      "Custom, responsive website development that loads fast, ranks on Google and turns visitors into leads. Built with Next.js, React or WordPress. Get a quote.",
  },
  "ecommerce-development": {
    title: "eCommerce Website Development | BSH Solutions",
    description:
      "Shopify, WooCommerce and custom eCommerce development with secure checkout, fast pages and conversion-focused design. Launch an online store that sells.",
  },
  "mobile-app-development": {
    title: "Mobile App Development (iOS & Android) | BSH Solutions",
    description:
      "iOS and Android app development from UX design to App Store and Play Store launch, connected to your backend and data. Get a free mobile app quote today.",
  },
  "custom-software-development": {
    title: "Custom Software Development Company | BSH Solutions",
    description:
      "Custom CRMs, ERPs, SaaS platforms and internal tools built around how your business works. Discovery, design, development and support from one team.",
  },
  "web-application-development": {
    title: "Web Application Development Services | BSH Solutions",
    description:
      "Interactive, API-driven web applications, dashboards and portals built for speed, security and scale, with real-time features tested in every browser.",
  },
  "website-maintenance-support": {
    title: "Website Maintenance & Support Plans | BSH Solutions",
    description:
      "Website maintenance and support: 24/7 monitoring, updates, backups, security patches and speed audits that keep your website fast, secure and online.",
  },

  // ── Design ──
  "brand-identity-design": {
    title: "Brand Identity Design Agency | BSH Solutions",
    description:
      "Brand strategy, visual identity and brand guidelines that make your business recognisable and trusted: logo, colours, typography and messaging done right.",
  },
  "ui-ux-design": {
    title: "UI/UX Design Services | BSH Solutions",
    description:
      "User research, wireframes, prototypes and polished UI design for websites and mobile apps. Intuitive interfaces that improve usability and conversions.",
  },
  "graphic-design": {
    title: "Graphic Design Services | BSH Solutions",
    description:
      "Professional graphic design for social media, ads, print and presentations. On-brand visuals that communicate clearly and get your message noticed.",
  },
  "logo-design": {
    title: "Custom Logo Design Services | BSH Solutions",
    description:
      "Custom logo design that is unique, memorable and works everywhere, from your website to signage and packaging. Build instant recognition for your brand.",
  },
  "motion-graphics-design": {
    title: "Motion Graphics & Animation Design | BSH Solutions",
    description:
      "Motion graphics for ads, explainer videos, social media and brand films. Engaging animated visuals that grab attention and explain your offer in seconds.",
  },
  "packaging-design": {
    title: "Product Packaging Design Services | BSH Solutions",
    description:
      "Product packaging and label design that stands out on the shelf and online. Print-ready designs that reflect your brand and help your product sell more.",
  },

  // ── Marketing ──
  "ppc-advertising": {
    title: "PPC Advertising & Google Ads Management | BSH Solutions",
    description:
      "Performance-driven PPC management for Google Ads and social ads: keyword research, ad copy, landing pages and conversion tracking that maximise your ROI.",
  },
  "social-media-marketing": {
    title: "Social Media Marketing Services | BSH Solutions",
    description:
      "Social media marketing strategy, content and paid campaigns for Facebook, Instagram, LinkedIn and TikTok that grow your audience and drive enquiries.",
  },
  "seo-optimization": {
    title: "SEO Services & Search Engine Optimization | BSH Solutions",
    description:
      "Technical SEO, on-page optimisation, content and link building that move your website up Google rankings and bring steady organic traffic and leads.",
  },
  "email-marketing": {
    title: "Email Marketing Services | BSH Solutions",
    description:
      "Personalised, automated email marketing campaigns and newsletters that nurture leads, bring customers back and drive measurable revenue for your business.",
  },
  "content-marketing": {
    title: "Content Marketing Agency | BSH Solutions",
    description:
      "SEO content strategy, blog writing and website copy that ranks on Google, builds authority and turns readers into customers. Plans built around your goals.",
  },
  "influencer-marketing": {
    title: "Influencer Marketing Services | BSH Solutions",
    description:
      "Influencer marketing campaigns that connect your brand with trusted creators: creator sourcing, campaign management and reporting that drives real reach.",
  },

  // ── Photography & video ──
  "product-photography": {
    title: "Product Photography Services | BSH Solutions",
    description:
      "Professional product photography for eCommerce, Amazon, catalogues and ads. Clean, high-quality images that show your products clearly and boost sales.",
  },
  "brand-shoots": {
    title: "Brand Photography & Brand Shoots | BSH Solutions",
    description:
      "Custom brand photography that shows your real people, spaces and personality. Authentic images for your website, social media and marketing campaigns.",
  },
  "event-coverage": {
    title: "Event Photography & Video Coverage | BSH Solutions",
    description:
      "Professional photo and video coverage for corporate events, launches, conferences and celebrations, delivered fully edited and ready to share online.",
  },
  "video-production": {
    title: "Video Production Services | BSH Solutions",
    description:
      "Full-service video production from concept and script to filming and final edit. Brand films, ads, explainers and social videos that get real results.",
  },
  "photo-editing-retouching": {
    title: "Photo Editing & Retouching Services | BSH Solutions",
    description:
      "Expert photo editing and retouching: background removal, colour correction, skin and product retouching that makes every image look its very best.",
  },
  "drone-photography": {
    title: "Drone Photography & Aerial Video | BSH Solutions",
    description:
      "Licensed drone photography and aerial video for real estate, construction, corporate and events: perspectives that ground cameras simply cannot capture.",
  },

  // ── AI ──
  "ai-automation": {
    title: "AI Automation Agency & AI Agents | BSH Solutions",
    description:
      "AI automation and custom AI agents that handle data entry, reporting, email and CRM work, so your team saves hours every week. Book a free consultation.",
  },
  "social-media-automation": {
    title: "AI Social Media Automation | BSH Solutions",
    description:
      "AI social media automation: auto-posting, AI-generated captions and content, smart scheduling and analytics that keep your brand active online 24/7.",
  },
  "ai-chatbots": {
    title: "AI Chatbot Development Company | BSH Solutions",
    description:
      "Custom AI chatbots for websites, WhatsApp and Facebook, trained on your business data. Answer customers 24/7, capture more leads and cut support time.",
  },
  "ai-website-integration": {
    title: "AI Website Integration Services | BSH Solutions",
    description:
      "Add AI to your website: chat assistants, smart search, product recommendations and personalised content, integrated cleanly with your existing stack.",
  },
  "aeo-ai-enablement": {
    title: "AEO Agency: Answer Engine Optimization | BSH Solutions",
    description:
      "Answer engine optimization (AEO) that gets your business cited in ChatGPT, Gemini and Google AI answers, plus AI strategy consulting for your team.",
  },
  "ai-video-automation": {
    title: "AI Video Automation Services | BSH Solutions",
    description:
      "AI video automation that turns one idea into a steady stream of videos: scripts, AI voiceovers, editing and publishing for YouTube, TikTok and Reels.",
  },
};

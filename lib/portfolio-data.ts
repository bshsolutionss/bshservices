import { SITE_URL } from "./site";

/**
 * Single source of truth for the portfolio: the homepage showcase, the
 * /portfolio grid, every /portfolio/[slug] case study, the sitemap, the
 * JSON-LD and the CSP `frame-src` (live previews) all read from here.
 *
 * Copy rule: describe only what is visible on the live site. There are no
 * invented numbers — add real results through the optional `metrics` field
 * (e.g. { label: "Load time", value: "1.1s" }) once you have verified ones,
 * and they will appear automatically on the case study and the showcase.
 */
export interface PortfolioMetric {
  label: string;
  value: string;
}

export interface PortfolioProject {
  slug: string;
  title: string;
  /** Short label shown on cards, e.g. "eCommerce". */
  category: string;
  /** Who the site is for. */
  industry: string;
  /** One line under the title. */
  tagline: string;
  /** 1–2 sentences for cards, meta description and schema. */
  description: string;
  /** Longer copy for the case-study page (paragraphs). */
  overview: string[];
  /** What BSH delivered. */
  services: string[];
  /** Three short, visible-on-site highlights. */
  highlights: string[];
  /** Stack, only if verified (rendered when present). */
  tech?: string[];
  /** Verified results only (rendered when present). */
  metrics?: PortfolioMetric[];
  keywords: string[];
  /** Full-page screenshot under /public. */
  image: string;
  imageWidth: number;
  imageHeight: number;
  /** Live site. */
  link: string;
}

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    slug: "migration-republic",
    title: "Migration Republic",
    category: "Web Development",
    industry: "Migration services (Australia)",
    tagline: "A trust-first website for an Australian migration consultancy.",
    description:
      "A professional website for Migration Republic, an Australian migration services consultancy, presenting registered-expert support and a clear path to book a consultation.",
    overview: [
      "Migration Republic helps people move to Australia, so the website has one job above all: make a stranger trust the team quickly. The homepage leads with a clear promise, backs it with partner and credential logos, and keeps the Book Consultation action within reach on every screen.",
      "BSH Solutions designed and developed the full site, from the layout and visual identity to the responsive build, so visitors can read the services, learn about the team and get in touch from any device.",
    ],
    services: ["Website design & development", "Responsive build", "Conversion-focused layout"],
    highlights: [
      "Prominent Book Consultation call to action",
      "Trust section with partner logos and registered-expert messaging",
      "Clear navigation: Services, About, Contact and Blog",
    ],
    keywords: ["migration website design", "Australian migration agency website", "consultation booking website"],
    image: "/portfolio/migrationrepublic.webp",
    imageWidth: 1920,
    imageHeight: 6199,
    link: "https://migrationrepublic.com.au",
  },
  {
    slug: "migration-factor",
    title: "Migration Factor",
    category: "Branding & Web",
    industry: "Migration & study-abroad consultancy",
    tagline: "A brand and website for students and professionals going global.",
    description:
      "Branding and a full website for Migration Factor, guiding students and professionals toward international study and migration with expert counselling.",
    overview: [
      "Migration Factor speaks to students and professionals planning a life abroad. The site opens with a full-width hero that sells the outcome (“Turn Your Global Dreams into Reality”) and pairs it with a single, obvious next step.",
      "We shaped the visual identity and built the website around it, with a contact bar in the header so phone, email and social links are always one tap away.",
    ],
    services: ["Branding", "Website design & development", "Responsive build"],
    highlights: [
      "Full-width hero slider with a Start Your Journey action",
      "Contact bar with phone, email and social links in the header",
      "Branding carried across logo, colours and imagery",
    ],
    keywords: ["migration consultancy branding", "study abroad website", "visa consultant website design"],
    image: "/portfolio/migrationfactor.webp",
    imageWidth: 1920,
    imageHeight: 14198,
    link: "https://migrationfactor.com.au",
  },
  {
    slug: "aisha-academy",
    title: "Aisha Academy",
    category: "EdTech Solution",
    industry: "Online education",
    tagline: "A warm, welcoming home for an online learning academy.",
    description:
      "A distinctive brown-and-gold website for Aisha Academy, an online learning academy, with a welcoming hero and clear actions for parents and students.",
    overview: [
      "Aisha Academy needed a site that feels warm and trustworthy to parents while staying easy for students to navigate. The design uses a rich brown-and-gold palette, real imagery of learners and two clear actions in the hero.",
      "The website supports both Arabic and English text, so every visitor can read it comfortably, and it is built to work smoothly on phones, where most parents will open it.",
    ],
    services: ["Website design & development", "UI/UX design", "Responsive build"],
    highlights: [
      "Distinct brown-and-gold brand look",
      "Hero with imagery of students and two clear actions",
      "Supports Arabic and English text",
    ],
    keywords: ["online academy website", "education website design", "edtech website development"],
    image: "/portfolio/aisha-academy.webp",
    imageWidth: 1600,
    imageHeight: 10549,
    link: "https://aisha-academy.com/",
  },
  {
    slug: "silwalo",
    title: "Silwalo",
    category: "eCommerce",
    industry: "Fashion retail",
    tagline: "A collection-led online clothing store.",
    description:
      "An online fashion store for Silwalo, built around new arrivals and collections, with cart and account built into a clean shopping experience.",
    overview: [
      "Silwalo sells clothing online, so the storefront puts the product first: a large collection hero, a New Arrivals section and a simple path from browsing to cart.",
      "We built the store with straightforward navigation (Shop, Our Collection, New Arrivals and Ready To Wear) and kept cart and account within reach in the header, so shoppers never have to hunt for them.",
    ],
    services: ["eCommerce development", "UI/UX design", "Responsive build"],
    highlights: [
      "Collection-led homepage with a New Arrivals section",
      "Store navigation: Shop, Collection, New Arrivals, Ready To Wear",
      "Cart and account built into the header",
    ],
    keywords: ["fashion eCommerce website", "online clothing store development", "Pakistan eCommerce website"],
    image: "/portfolio/silwalo.webp",
    imageWidth: 1920,
    imageHeight: 9777,
    link: "https://silwalo.com",
  },
  {
    slug: "admin-dashboard",
    title: "Admin Dashboard",
    category: "Custom Software",
    industry: "Retail operations software",
    tagline: "A store admin dashboard for orders, products and revenue.",
    description:
      "A custom admin dashboard for a home-decor store with order and revenue trends, a pending-actions panel and sidebar navigation for the core areas of the business.",
    overview: [
      "This is a custom-built back office for a home-decor store. Instead of juggling spreadsheets, the team gets one screen with the numbers that matter: order and revenue trends, recent orders and a panel of pending actions.",
      "BSH Solutions designed the interface and built the application, with sidebar navigation for the main areas of the store so day-to-day tasks take as few clicks as possible.",
    ],
    services: ["Custom software development", "Dashboard UI/UX design", "Web application development"],
    highlights: [
      "Order and revenue trend charts",
      "Pending-actions panel for day-to-day operations",
      "Sidebar navigation for the core store areas",
    ],
    keywords: ["custom admin dashboard", "eCommerce admin panel development", "business dashboard design"],
    image: "/portfolio/admindashboard.webp",
    imageWidth: 1920,
    imageHeight: 1860,
    link: "https://home-decor-admins.vercel.app/",
  },
  {
    slug: "almacca",
    title: "Almacca",
    category: "Web Development",
    industry: "Catering & hospitality",
    tagline: "An appetising website for a premium catering company.",
    description:
      "A website for Al-Macca Caterers, a premium Pakistani catering business, with a full-width food hero and clear menu and enquiry actions.",
    overview: [
      "Al-Macca Caterers sells an experience, so the website leads with food: a full-width hero for Premium Catering Services with authentic Pakistani cuisine for every occasion.",
      "We designed and built the site so customers can see the menu and get in touch above the fold, and learn more about the business as they scroll.",
    ],
    services: ["Website design & development", "Responsive build"],
    highlights: [
      "Appetising full-width hero for Premium Catering Services",
      "Clear menu and enquiry actions above the fold",
      "About section that tells the business story",
    ],
    keywords: ["catering website design", "restaurant website development", "Pakistani catering website"],
    image: "/portfolio/almacca.webp",
    imageWidth: 1920,
    imageHeight: 8407,
    link: "https://almacca-eta.vercel.app/",
  },
  {
    slug: "golden-shiruh-llc",
    title: "Golden Shiruh LLC",
    category: "Agency Website",
    industry: "Amazon growth agency",
    tagline: "An animated agency site built to win audit requests.",
    description:
      "An animated website for Golden Shiruh LLC, an Amazon scaling agency, built around one goal: turning visitors into free audit requests.",
    overview: [
      "Golden Shiruh LLC helps brands scale on Amazon. The homepage opens with a bold promise (“Scale Your Brand Beyond The Revenue Ceiling”) next to an animated particle visual, and drives visitors to one primary action: Get Your Free Audit.",
      "BSH Solutions designed the clean green-and-white brand system and built the site, including the motion, so it feels modern and credible without slowing the page down.",
    ],
    services: ["Website design & development", "Animation & motion", "Conversion-focused layout"],
    highlights: [
      "Animated hero with a live particle visual",
      "Primary action: Get Your Free Audit",
      "Clean green-and-white brand system",
    ],
    keywords: ["agency website design", "Amazon agency website", "animated website development"],
    image: "/portfolio/goldenshiruh.webp",
    imageWidth: 1600,
    imageHeight: 13586,
    link: "https://goldenshiruhllc.com/",
  },
  {
    slug: "anh-supplies",
    title: "ANH Supplies",
    category: "eCommerce",
    industry: "Home & decor retail",
    tagline: "A home-and-decor store with a hero built to sell.",
    description:
      "An online store for ANH Supplies covering home and decor products, with a prominent Buy Now hero, product exploration sections and search, cart and account in the header.",
    overview: [
      "ANH Supplies sells home and decor products online. The storefront opens with a large lifestyle hero and a Buy Now action, then moves straight into product exploration so shoppers can start browsing without any friction.",
      "We built the store with search, cart and account in the header and clear navigation across products, so customers can find what they want and check out confidently on any device.",
    ],
    services: ["eCommerce development", "UI/UX design", "Responsive build"],
    highlights: [
      "Home & decor storefront with a prominent Buy Now hero",
      "Product exploration sections with category imagery",
      "Search, cart and account in the header",
    ],
    keywords: ["home decor eCommerce website", "online store development", "eCommerce website design"],
    image: "/portfolio/anhsupplies.webp",
    imageWidth: 1920,
    imageHeight: 13258,
    link: "https://anhsupplies.com/",
  },
  {
    slug: "promptflow",
    title: "PromptFlow",
    category: "AI Web App",
    industry: "AI productivity tool (SaaS)",
    tagline: "An AI tool that turns simple ideas into professional prompts.",
    description:
      "PromptFlow is an AI web app that turns plain-language ideas, in English or Roman Urdu, into structured, professional prompts for ChatGPT, Gemini, Claude, Midjourney and more.",
    overview: [
      "PromptFlow solves a simple problem: most people write weak prompts and get weak AI results. You describe what you want in plain English or Roman Urdu, choose a prompt type, and the app turns it into a structured, professional prompt.",
      "BSH Solutions designed and developed the product, from the dark, developer-style interface to the prompt-type picker, the style options (Detailed, Creative or Concise) and the landing page that explains how it works.",
    ],
    services: ["Web application development", "UI/UX design", "AI integration"],
    highlights: [
      "Prompt types for ChatGPT & Claude, Midjourney, coding and copywriting",
      "Write in English or Roman Urdu",
      "Live generator with Detailed, Creative and Concise styles",
    ],
    keywords: ["AI prompt generator", "AI web app development", "SaaS product development", "prompt engineering tool"],
    image: "/portfolio/promptflow.webp",
    imageWidth: 1600,
    imageHeight: 4822,
    link: "https://promptflow.solutions",
  },
];

export function getProject(slug: string): PortfolioProject | undefined {
  return PORTFOLIO_PROJECTS.find((p) => p.slug === slug);
}

export function getProjectPath(project: Pick<PortfolioProject, "slug">): string {
  return `/portfolio/${project.slug}`;
}

/** Other projects, preferring the same category first. */
export function getRelatedProjects(slug: string, count = 3): PortfolioProject[] {
  const current = getProject(slug);
  const others = PORTFOLIO_PROJECTS.filter((p) => p.slug !== slug);
  const same = others.filter((p) => current && p.category === current.category);
  const rest = others.filter((p) => !same.includes(p));
  return [...same, ...rest].slice(0, count);
}

/** Host without protocol/www, for the fake browser address bar. */
export function displayHost(link: string): string {
  return new URL(link).host.replace(/^www\./, "");
}

const ORG = { "@type": "Organization", name: "BSH Solutions", url: SITE_URL } as const;

/** schema.org/CreativeWork for one case-study page. */
export function projectJsonLd(project: PortfolioProject) {
  const pageUrl = `${SITE_URL}${getProjectPath(project)}`;
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${pageUrl}#project`,
    name: `${project.title} — ${project.category}`,
    headline: project.tagline,
    description: project.description,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    image: `${SITE_URL}${project.image}`,
    thumbnailUrl: `${SITE_URL}${project.image}`,
    genre: project.category,
    keywords: project.keywords.join(", "),
    inLanguage: "en",
    creator: ORG,
    publisher: ORG,
    about: {
      "@type": "WebSite",
      name: project.title,
      url: project.link,
      description: project.description,
    },
    isPartOf: { "@type": "CollectionPage", name: "BSH Solutions Portfolio", url: `${SITE_URL}/portfolio` },
  };
}

/** schema.org/CollectionPage + ItemList for the /portfolio index. */
export function portfolioIndexJsonLd(projects: PortfolioProject[] = PORTFOLIO_PROJECTS) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "BSH Solutions Portfolio — Live Client Projects",
    description:
      "Real, live client projects by BSH Solutions: websites, eCommerce stores, dashboards and custom software.",
    url: `${SITE_URL}/portfolio`,
    publisher: ORG,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: projects.length,
      itemListElement: projects.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}${getProjectPath(p)}`,
        name: p.title,
        image: `${SITE_URL}${p.image}`,
      })),
    },
  };
}

/**
 * Centralized service catalogue.
 *
 * Every sub-service page under `app/Services/<category>/[service]/page.tsx`
 * is generated from this single file — see `components/services/detail/ServiceDetailPage.tsx`
 * for the shared template that consumes it, and `README.md` for the architecture overview.
 *
 * To add a 31st service: add one object to `SERVICES` below and (optionally) one
 * hero/section image under `public/images/<category>/`. No routing or component
 * changes are required.
 */
import type { IconType } from "react-icons";

import {
  SiAdobe,
  SiFigma,
  SiCanva,
  SiAdobexd,
  SiSketch,
  SiInvision,
  SiBlender,
  SiCinema4D,
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
  SiGoogleads,
  SiMeta,
  SiLinkedin,
  SiGoogleanalytics,
  SiBuffer,
  SiHootsuite,
  SiSemrush,
  SiYoast,
  SiMailchimp,
  SiHubspot,
  SiNotion,
  SiGrammarly,
  SiGoogledocs,
  SiInstagram,
  SiTiktok,
  SiUpwork,
  SiDavinciresolve,
  SiGooglecloud,
  SiZapier,
  SiOpenai,
} from "react-icons/si";
import {
  FaBoxOpen,
  FaJava,
  FaAws,
  FaTools,
  FaSearchengin,
  FaUserFriends,
  FaGoogle,
  FaCamera,
  FaVideo,
  FaPhotoVideo,
  FaMicrophoneAlt,
  FaRobot,
  FaCogs,
  FaSearch,
} from "react-icons/fa";
import { MdOutlineColorLens, MdIntegrationInstructions } from "react-icons/md";
import { TbDrone, TbCameraSelfie } from "react-icons/tb";

export type ServiceCategorySlug =
  | "development"
  | "designing"
  | "marketing"
  | "photography"
  | "ai";

export interface ServiceCategoryInfo {
  slug: ServiceCategorySlug;
  /** Full display name, e.g. "Web & Software Development" */
  name: string;
  /** Short label used in breadcrumbs / forms, e.g. "Development" */
  shortName: string;
  description: string;
  /** Category overview page, e.g. /Services/development */
  overviewPath: string;
}

export interface TechItem {
  name: string;
  icon: IconType;
  color?: string;
}

export interface ServiceBenefit {
  title: string;
  description: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServiceDefinition {
  slug: string;
  category: ServiceCategorySlug;
  /** Display title, e.g. "Website Development" */
  name: string;
  /** One-line summary used in cards, related-service links, and OG/Twitter fallback */
  shortDescription: string;
  /** 2–3 sentence overview rendered under the H1 */
  description: string;
  /** Section + hero image, reused from the existing category page assets */
  image: string;
  features: string[];
  benefits: ServiceBenefit[];
  technologies: TechItem[];
  faqs: ServiceFaq[];
  keywords: string[];
}

export const SERVICE_CATEGORIES: Record<ServiceCategorySlug, ServiceCategoryInfo> = {
  development: {
    slug: "development",
    name: "Web & Software Development",
    shortName: "Development",
    description: "Fast, scalable, and beautiful web experiences tailored to your business.",
    overviewPath: "/Services/development",
  },
  designing: {
    slug: "designing",
    name: "Creative Design",
    shortName: "Designing",
    description: "Visually stunning designs that inspire, engage, and connect with your audience.",
    overviewPath: "/Services/designing",
  },
  marketing: {
    slug: "marketing",
    name: "Digital Marketing",
    shortName: "Marketing",
    description: "Data-driven digital marketing that helps your brand grow, engage, and convert.",
    overviewPath: "/Services/marketing",
  },
  photography: {
    slug: "photography",
    name: "Photography & Videography",
    shortName: "Photography",
    description: "Professional photo and video production that tells your brand's story.",
    overviewPath: "/Services/photography",
  },
  ai: {
    slug: "ai",
    name: "AI Automation Services",
    shortName: "AI Services",
    description: "Practical AI solutions that help businesses automate, scale, and grow.",
    overviewPath: "/Services/ai",
  },
};

export const SERVICES: ServiceDefinition[] = [
  // ───────────────────────── DEVELOPMENT ─────────────────────────
  {
    slug: "website-development",
    category: "development",
    name: "Website Development",
    shortDescription: "Responsive, SEO-friendly websites built for speed and conversions.",
    description:
      "We design and build fast, secure, and visually polished websites that turn visitors into customers. Every site is coded with clean, semantic markup, optimized for Core Web Vitals, and structured for search engines from day one — so you get a website that looks great and actually ranks.",
    image: "/images/development/1.png",
    features: [
      "Fast and secure performance",
      "Custom UI/UX design",
      "SEO optimized structure",
      "Fully responsive layouts",
    ],
    benefits: [
      { title: "Higher conversions", description: "A fast, intuitive site turns more visitors into leads and customers." },
      { title: "Built to rank", description: "Clean, semantic code gives search engines exactly what they need to index and rank your pages." },
      { title: "Scales with you", description: "A component-based build makes adding new pages and features straightforward later." },
    ],
    technologies: [
      { name: "JavaScript", icon: SiJavascript, color: "#F7DF1E" },
      { name: "Next.js", icon: SiNextdotjs, color: "#000000" },
      { name: "React", icon: SiReact, color: "#61DBFB" },
      { name: "Tailwind CSS", icon: SiTailwindcss, color: "#38BDF8" },
      { name: "Three.js", icon: SiThreedotjs, color: "#0b0b0b" },
      { name: "Angular", icon: SiAngular, color: "#DD0031" },
      { name: "PHP", icon: SiPhp, color: "#777BB4" },
    ],
    faqs: [
      { question: "How long does a custom website take to build?", answer: "Most business websites launch within 3–6 weeks depending on page count and features. We confirm an exact timeline after the first scoping call." },
      { question: "Will my website be mobile-friendly?", answer: "Yes — every site we build is fully responsive and tested across phones, tablets, and desktops before launch." },
      { question: "Do you handle hosting and domain setup too?", answer: "Yes, we can set up hosting, domain connection, and SSL for you, or work alongside your existing provider." },
    ],
    keywords: ["custom website development", "business website design", "responsive web design", "SEO friendly website"],
  },
  {
    slug: "ecommerce-development",
    category: "development",
    name: "E-Commerce Development",
    shortDescription: "Custom online stores with secure payments and effortless management.",
    description:
      "We build online stores that make it easy for customers to browse, buy, and come back. From product catalogues to secure checkout and payment gateways, every store we launch is fast, mobile-optimized, and built to scale as your catalogue and traffic grow.",
    image: "/images/development/2.png",
    features: [
      "Custom product management",
      "Secure payment integration",
      "Fast checkout process",
      "Scalable and SEO-ready store",
    ],
    benefits: [
      { title: "More completed checkouts", description: "A streamlined, fast checkout flow reduces cart abandonment." },
      { title: "Secure by default", description: "PCI-compliant payment gateways keep your customers' data protected." },
      { title: "Grows with your catalogue", description: "Add products, categories, and promotions without rebuilding the store." },
    ],
    technologies: [
      { name: "Shopify", icon: SiShopify, color: "#96BF48" },
      { name: "WordPress", icon: SiWordpress, color: "#21759B" },
      { name: "WooCommerce", icon: SiWoocommerce, color: "#96588A" },
      { name: "Stripe", icon: SiStripe, color: "#635BFF" },
      { name: "PayPal", icon: SiPaypal, color: "#00457C" },
    ],
    faqs: [
      { question: "Which platform do you recommend — Shopify or WooCommerce?", answer: "It depends on your catalogue size and budget. We'll recommend the right fit after understanding your products and growth plans." },
      { question: "Can you migrate my existing store?", answer: "Yes, we handle migrations from other platforms, including products, customers, and order history where supported." },
      { question: "Do you set up payment gateways for me?", answer: "Yes — Stripe, PayPal, and most regional gateways are configured and tested before launch." },
    ],
    keywords: ["eCommerce website development", "Shopify development", "WooCommerce store", "online store setup"],
  },
  {
    slug: "mobile-app-development",
    category: "development",
    name: "Mobile App Development",
    shortDescription: "High-performance iOS and Android apps built for a seamless experience.",
    description:
      "We design and build mobile apps that feel native, load fast, and work reliably across devices. From first wireframe to App Store and Play Store submission, we handle the UI, backend integration, and deployment so your app is ready for real users.",
    image: "/images/development/3.png",
    features: [
      "Cross-platform support",
      "Intuitive UI/UX design",
      "App Store & Play Store deployment",
      "Backend integration",
    ],
    benefits: [
      { title: "One codebase, two platforms", description: "Cross-platform development gets you to iOS and Android faster and for less." },
      { title: "Store-ready from day one", description: "We handle App Store and Play Store submission requirements so launch isn't delayed." },
      { title: "Connected to your systems", description: "Your app integrates cleanly with the backend, APIs, and data you already run on." },
    ],
    technologies: [
      { name: "React Native", icon: SiReact, color: "#61DBFB" },
      { name: "Flutter", icon: SiFlutter, color: "#02569B" },
      { name: "iOS", icon: SiApple, color: "#A2AAAD" },
      { name: "Android", icon: SiAndroid, color: "#3DDC84" },
    ],
    faqs: [
      { question: "Do you build for both iOS and Android?", answer: "Yes, using cross-platform frameworks like React Native and Flutter, we can ship to both from a single codebase." },
      { question: "Do you handle App Store and Play Store submission?", answer: "Yes, we prepare listings, assets, and handle the submission and review process for both stores." },
      { question: "Can the app connect to my existing website or database?", answer: "Yes, we integrate with your existing APIs, databases, or build new endpoints as needed." },
    ],
    keywords: ["mobile app development", "iOS app development", "Android app development", "cross-platform app"],
  },
  {
    slug: "custom-software-development",
    category: "development",
    name: "Custom Software Development",
    shortDescription: "Tailored business software that automates workflows and cuts costs.",
    description:
      "When off-the-shelf tools don't fit how your business actually works, we build software that does. From internal dashboards to workflow automation and custom APIs, we design systems around your exact processes so your team spends less time on manual work.",
    image: "/images/development/4.png",
    features: [
      "End-to-end development",
      "Custom APIs and dashboards",
      "Cloud integration",
      "Scalable architecture",
    ],
    benefits: [
      { title: "Built around your process", description: "No forcing your workflow into a generic tool — the software fits how your team already works." },
      { title: "Less manual work", description: "Automating repetitive tasks frees your team to focus on higher-value work." },
      { title: "Cloud-ready", description: "Deployed on scalable cloud infrastructure that grows with usage." },
    ],
    technologies: [
      { name: "Node.js", icon: SiNodedotjs, color: "#339933" },
      { name: "Python", icon: SiPython, color: "#3776AB" },
      { name: "Java", icon: FaJava, color: "#007396" },
      { name: ".NET", icon: SiDotnet, color: "#512BD4" },
    ],
    faqs: [
      { question: "What kinds of business software can you build?", answer: "Internal dashboards, CRMs, inventory systems, booking platforms, custom APIs, and workflow automation tools — if it's software your business needs, we can scope it." },
      { question: "How do you handle the requirements process?", answer: "We start with a discovery session to map your current process, then define the exact scope and features before writing any code." },
      { question: "Will I own the source code?", answer: "Yes, you receive full ownership of the codebase and documentation once the project is delivered." },
    ],
    keywords: ["custom software development", "business automation software", "internal tools development", "custom API development"],
  },
  {
    slug: "web-application-development",
    category: "development",
    name: "Web Application Development",
    shortDescription: "Interactive, API-driven web apps built for performance at scale.",
    description:
      "We build web applications — not just websites. Real-time dashboards, SaaS products, and interactive tools built with modern frameworks, optimized databases, and clean API design, so your app stays fast and reliable as usage grows.",
    image: "/images/development/5.png",
    features: [
      "Real-time functionality",
      "API integrations",
      "Database optimization",
      "Cross-browser compatibility",
    ],
    benefits: [
      { title: "Real-time by design", description: "Live data updates and interactive features without page reloads." },
      { title: "Optimized under load", description: "Database and query design keep performance solid as your user base grows." },
      { title: "Works everywhere", description: "Tested across major browsers so every user gets a consistent experience." },
    ],
    technologies: [
      { name: "Next.js", icon: SiNextdotjs, color: "#000000" },
      { name: "Supabase", icon: SiSupabase, color: "#3ECF8E" },
      { name: "Firebase", icon: SiFirebase, color: "#FFCA28" },
      { name: "Prisma", icon: SiPrisma, color: "#2D3748" },
    ],
    faqs: [
      { question: "What's the difference between a website and a web application?", answer: "A web application is interactive and data-driven — think dashboards, SaaS tools, or booking systems — rather than mostly static content." },
      { question: "Can you build a SaaS product from scratch?", answer: "Yes, from database design and authentication to billing integration and the front-end UI." },
      { question: "Do you support real-time features like live updates?", answer: "Yes, we implement real-time data sync using tools like Supabase and Firebase where it fits the product." },
    ],
    keywords: ["web application development", "SaaS development", "custom web app", "real-time web app"],
  },
  {
    slug: "website-maintenance-support",
    category: "development",
    name: "Website Maintenance & Support",
    shortDescription: "24/7 monitoring, updates, and security patches for peace of mind.",
    description:
      "A website is never really \"done\" — it needs updates, security patches, and monitoring to stay fast and safe. We keep your site running smoothly with regular maintenance, performance audits, and rapid support when something needs attention.",
    image: "/images/development/6.png",
    features: [
      "24/7 monitoring",
      "Regular updates",
      "Security patches",
      "Performance audits",
    ],
    benefits: [
      { title: "Fewer surprises", description: "Continuous monitoring catches issues before your visitors ever notice them." },
      { title: "Stays secure", description: "Regular patching closes vulnerabilities before they become a problem." },
      { title: "Consistent performance", description: "Periodic audits keep load times fast as content and traffic grow." },
    ],
    technologies: [
      { name: "GitHub", icon: SiGithub, color: "#0b0b0b" },
      { name: "Docker", icon: SiDocker, color: "#2496ED" },
      { name: "AWS", icon: FaAws, color: "#FF9900" },
      { name: "CI/CD", icon: FaTools, color: "#E24329" },
    ],
    faqs: [
      { question: "Do I need a maintenance plan if my site already works fine?", answer: "Yes — most issues (security vulnerabilities, plugin conflicts, slow load times) build up silently until something breaks. Maintenance catches them early." },
      { question: "How fast do you respond to urgent issues?", answer: "Critical issues (site down, security incidents) are prioritized and addressed as fast as possible; typical response is same business day." },
      { question: "Can you take over maintenance for a site you didn't build?", answer: "Yes, we regularly take over maintenance for existing sites after a short technical review." },
    ],
    keywords: ["website maintenance services", "website support plan", "website security monitoring", "site performance audit"],
  },

  // ───────────────────────── DESIGNING ─────────────────────────
  {
    slug: "brand-identity-design",
    category: "designing",
    name: "Branding & Identity Design",
    shortDescription: "Cohesive brand identities that build trust and recognition.",
    description:
      "Your brand identity is the first impression customers form of your business. We create cohesive visual identities — logo, color palette, typography, and guidelines — that reflect your values and stay consistent everywhere your brand shows up.",
    image: "/images/Designing/1.png",
    features: [
      "Logo & color palette creation",
      "Typography and brand guidelines",
      "Brand storytelling and strategy",
      "Consistent visual identity design",
    ],
    benefits: [
      { title: "Instant recognition", description: "A consistent identity makes your brand memorable across every touchpoint." },
      { title: "Built-in guidelines", description: "A documented style guide keeps your brand consistent even as your team grows." },
      { title: "Stronger trust", description: "Professional, cohesive branding signals credibility to new customers." },
    ],
    technologies: [
      { name: "Adobe Illustrator", icon: SiAdobe, color: "#FF9A00" },
      { name: "Adobe Photoshop", icon: SiAdobe, color: "#31A8FF" },
      { name: "Figma", icon: SiFigma, color: "#F24E1E" },
      { name: "Canva", icon: SiCanva, color: "#00C4CC" },
    ],
    faqs: [
      { question: "What's included in a branding package?", answer: "Logo design, color palette, typography, and a brand guideline document — the full toolkit to keep your visuals consistent." },
      { question: "Can you rebrand an existing business?", answer: "Yes, we handle both brand-new identities and refreshes of existing brands that need to modernize." },
      { question: "Will I get the source files?", answer: "Yes, you receive all source files (AI, PSD, Figma) and export formats for web and print." },
    ],
    keywords: ["branding agency", "brand identity design", "logo and brand guidelines", "corporate branding services"],
  },
  {
    slug: "ui-ux-design",
    category: "designing",
    name: "UI/UX Design",
    shortDescription: "Intuitive interfaces that improve usability and conversion.",
    description:
      "Good design isn't just how it looks — it's how it works. We research your users, wireframe the experience, and design interfaces that are intuitive, accessible, and built to move people toward the action you want them to take.",
    image: "/images/Designing/2.png",
    features: [
      "User research and wireframing",
      "High-fidelity prototyping",
      "Responsive UI layouts",
      "Design system creation",
    ],
    benefits: [
      { title: "Higher usability", description: "Interfaces designed around real user behavior reduce friction and drop-off." },
      { title: "Faster development handoff", description: "Detailed prototypes and design systems speed up engineering implementation." },
      { title: "Consistent at scale", description: "A reusable design system keeps every new screen on-brand and on-pattern." },
    ],
    technologies: [
      { name: "Figma", icon: SiFigma, color: "#F24E1E" },
      { name: "Adobe XD", icon: SiAdobexd, color: "#FF61F6" },
      { name: "Sketch", icon: SiSketch, color: "#F7B500" },
      { name: "InVision", icon: SiInvision, color: "#FF3366" },
    ],
    faqs: [
      { question: "Do you design for both web and mobile?", answer: "Yes, we design responsive interfaces for web, and native-feeling layouts for iOS and Android." },
      { question: "Can you design a system for our existing product?", answer: "Yes, we audit the current experience first and design improvements or a full design system around it." },
      { question: "What do you hand off to developers?", answer: "Interactive Figma prototypes, a component design system, and specs — everything a development team needs to build accurately." },
    ],
    keywords: ["UI UX design agency", "user interface design", "product design services", "design system creation"],
  },
  {
    slug: "graphic-design",
    category: "designing",
    name: "Graphic Design",
    shortDescription: "Stunning digital and print visuals that communicate clearly.",
    description:
      "From social media creatives to print collateral, our design team crafts visuals that communicate your message clearly and consistently. Every piece is designed with your brand guidelines in mind, so it looks like it belongs.",
    image: "/images/Designing/3.png",
    features: [
      "Social media creatives",
      "Brochures and posters",
      "Business cards & stationery",
      "Ad banners and marketing visuals",
    ],
    benefits: [
      { title: "On-brand every time", description: "Every asset follows your brand guidelines, so your visuals stay consistent." },
      { title: "Faster campaign turnaround", description: "Ready-to-publish creatives mean your marketing team can move quickly." },
      { title: "Multi-format ready", description: "Assets delivered for web, social, and print in the sizes you need." },
    ],
    technologies: [
      { name: "Photoshop", icon: SiAdobe, color: "#31A8FF" },
      { name: "Illustrator", icon: SiAdobe, color: "#FF9A00" },
      { name: "CorelDRAW", icon: SiAdobe, color: "#00A550" },
      { name: "Canva", icon: SiCanva, color: "#00C4CC" },
    ],
    faqs: [
      { question: "Do you design for both digital and print?", answer: "Yes, we design for social media, web, and print-ready formats including brochures, posters, and business cards." },
      { question: "How many revisions are included?", answer: "We work through structured revision rounds until the design meets your brief — exact rounds depend on the package agreed at kickoff." },
      { question: "Can you match our existing brand style?", answer: "Yes, we design within your existing brand guidelines, or help establish them if you don't have any yet." },
    ],
    keywords: ["graphic design services", "social media graphics", "print design agency", "marketing visuals design"],
  },
  {
    slug: "logo-design",
    category: "designing",
    name: "Logo Design",
    shortDescription: "Unique, memorable logos that create instant recognition.",
    description:
      "Your logo carries your brand everywhere. We design unique, scalable logos that capture your business's personality — from initial concepts through refined vector artwork ready for web, print, and merchandise.",
    image: "/images/Designing/4.png",
    features: [
      "Custom concept creation",
      "Vector-based precision design",
      "Multiple revisions & variations",
      "Brand alignment and scalability",
    ],
    benefits: [
      { title: "Truly custom", description: "Original concepts built for your business — not a template with your name added." },
      { title: "Scales cleanly", description: "Vector artwork stays crisp from a favicon to a billboard." },
      { title: "Multiple use-ready variations", description: "Light, dark, icon-only, and horizontal versions for every placement." },
    ],
    technologies: [
      { name: "Adobe Illustrator", icon: SiAdobe, color: "#FF9A00" },
      { name: "Affinity Designer", icon: SiAdobe, color: "#7E4DD2" },
      { name: "Figma", icon: SiFigma, color: "#F24E1E" },
      { name: "Canva", icon: SiCanva, color: "#00C4CC" },
    ],
    faqs: [
      { question: "How many logo concepts will I see?", answer: "We typically present multiple initial directions, then refine your preferred concept through revision rounds until it's ready." },
      { question: "What file formats do I receive?", answer: "Vector files (AI, SVG, EPS) plus PNG/JPG exports in the color variations and sizes you'll need." },
      { question: "Can you redesign our current logo instead of starting fresh?", answer: "Yes, we can modernize an existing logo while keeping the recognizable elements your customers already know." },
    ],
    keywords: ["logo design services", "custom logo design", "logo designer for business", "brand logo creation"],
  },
  {
    slug: "motion-graphics-design",
    category: "designing",
    name: "Motion Graphics",
    shortDescription: "Engaging motion visuals for ads, explainers, and brand videos.",
    description:
      "We bring static ideas to life with smooth, engaging motion design — animated logos, explainer videos, and social content that hold attention and explain your product or story faster than a static image ever could.",
    image: "/images/Designing/5.png",
    features: [
      "Animated logos and intros",
      "Explainer videos",
      "Social media animations",
      "Cinematic transitions & effects",
    ],
    benefits: [
      { title: "Higher engagement", description: "Motion content consistently outperforms static posts on social feeds." },
      { title: "Explains faster", description: "Complex products or ideas become clear in seconds with animated explainers." },
      { title: "Reusable brand assets", description: "Animated logo stings and templates can be reused across future content." },
    ],
    technologies: [
      { name: "After Effects", icon: SiAdobe, color: "#9999FF" },
      { name: "Premiere Pro", icon: SiAdobe, color: "#9999FF" },
      { name: "Blender", icon: SiBlender, color: "#F5792A" },
      { name: "Cinema 4D", icon: SiCinema4D, color: "#011A6A" },
    ],
    faqs: [
      { question: "How long is a typical explainer video?", answer: "Most explainer videos run 30–90 seconds — long enough to explain, short enough to hold attention." },
      { question: "Can you animate our existing logo?", answer: "Yes, we can turn a static logo into an animated intro/outro sting for videos and social content." },
      { question: "Do you write the script too?", answer: "Yes, we can handle scripting and storyboarding, or work from a script you already have." },
    ],
    keywords: ["motion graphics services", "explainer video production", "animated logo design", "social media animation"],
  },
  {
    slug: "packaging-design",
    category: "designing",
    name: "Packaging Design",
    shortDescription: "Professional product packaging that stands out and sells.",
    description:
      "Packaging is often the first physical touchpoint a customer has with your product. We design packaging that stands out on shelves and online, balancing shelf impact with print-ready technical accuracy.",
    image: "/images/Designing/6.png",
    features: [
      "Custom dieline design",
      "Print-ready artwork",
      "3D mockups & product visualization",
      "Material and color guidance",
    ],
    benefits: [
      { title: "Shelf-ready design", description: "Packaging designed to stand out at the point of purchase, physical or online." },
      { title: "Print-accurate files", description: "Dielines and artwork prepared to your printer's exact specifications." },
      { title: "See it before you print", description: "3D mockups let you review the final look before committing to a print run." },
    ],
    technologies: [
      { name: "Adobe Illustrator", icon: SiAdobe, color: "#FF9A00" },
      { name: "Adobe Photoshop", icon: SiAdobe, color: "#31A8FF" },
      { name: "Blender", icon: SiBlender, color: "#F5792A" },
      { name: "3D Mockup", icon: FaBoxOpen, color: "#00AEEF" },
    ],
    faqs: [
      { question: "Do you provide print-ready dielines?", answer: "Yes, we prepare technically accurate dielines matched to your product dimensions and printer requirements." },
      { question: "Can you show a 3D preview before printing?", answer: "Yes, we create 3D mockups so you can review how the final packaging will look before it goes to print." },
      { question: "Do you handle packaging for multiple product variants?", answer: "Yes, we design flexible templates that scale across product sizes, flavors, or SKUs." },
    ],
    keywords: ["packaging design agency", "product packaging design", "dieline design services", "3D packaging mockup"],
  },

  // ───────────────────────── MARKETING ─────────────────────────
  {
    slug: "ppc-advertising",
    category: "marketing",
    name: "PPC Advertising",
    shortDescription: "Performance-driven paid ad campaigns that maximize ROI.",
    description:
      "We build and manage Pay-Per-Click campaigns designed around measurable results, not just clicks. From keyword research to ad creative and conversion tracking, every campaign is optimized to bring down cost-per-acquisition over time.",
    image: "/images/Marketing/1.png",
    features: [
      "Keyword and audience research",
      "Google & Meta ad campaign setup",
      "A/B testing for ad creatives",
      "Conversion tracking and optimization",
    ],
    benefits: [
      { title: "Spend with confidence", description: "Every dollar is tracked back to real conversions, not vanity clicks." },
      { title: "Faster results", description: "Paid campaigns can drive qualified traffic while your organic strategy builds." },
      { title: "Continuously optimized", description: "Ongoing A/B testing lowers cost-per-acquisition over time." },
    ],
    technologies: [
      { name: "Google Ads", icon: SiGoogleads, color: "#4285F4" },
      { name: "Meta Ads", icon: SiMeta, color: "#1877F2" },
      { name: "LinkedIn Ads", icon: SiLinkedin, color: "#0A66C2" },
      { name: "Google Analytics", icon: SiGoogleanalytics, color: "#F9AB00" },
    ],
    faqs: [
      { question: "What's a realistic monthly ad budget to start?", answer: "It depends on your industry and goals — we'll recommend a starting budget after reviewing your market and competition." },
      { question: "Which platforms do you run ads on?", answer: "Primarily Google Ads and Meta Ads, with LinkedIn Ads for B2B campaigns where it fits." },
      { question: "How do you measure success?", answer: "Through conversion tracking tied to real business outcomes — leads, sales, or signups — not just clicks or impressions." },
    ],
    keywords: ["PPC advertising agency", "Google Ads management", "Meta ads campaigns", "paid search marketing"],
  },
  {
    slug: "social-media-marketing",
    category: "marketing",
    name: "Social Media Marketing",
    shortDescription: "Strategic content and campaigns that grow your audience.",
    description:
      "We help brands grow through consistent, engaging social media content and targeted campaigns. From content calendars to creative production and community engagement, we manage the day-to-day so your presence stays active and on-brand.",
    image: "/images/Marketing/2.png",
    features: [
      "Social media strategy & management",
      "Creative post & reel design",
      "Influencer collaborations",
      "Audience engagement & analytics",
    ],
    benefits: [
      { title: "Consistent presence", description: "A planned content calendar keeps your brand active without the daily scramble." },
      { title: "On-brand creative", description: "Every post and reel is designed to match your visual identity." },
      { title: "Data-backed decisions", description: "Regular analytics reviews show what's resonating so we can double down on it." },
    ],
    technologies: [
      { name: "Meta Business Suite", icon: SiMeta, color: "#1877F2" },
      { name: "Canva", icon: SiCanva, color: "#00C4CC" },
      { name: "Buffer", icon: SiBuffer, color: "#323B43" },
      { name: "Hootsuite", icon: SiHootsuite, color: "#FF7A00" },
    ],
    faqs: [
      { question: "Which platforms do you manage?", answer: "Instagram, Facebook, LinkedIn, and TikTok most commonly — we'll recommend the platforms that fit your audience." },
      { question: "Do you create the content or do we?", answer: "We handle content creation end-to-end — planning, design, captions, and scheduling — with your review before anything goes live." },
      { question: "How often will you post?", answer: "Posting frequency is set in your content calendar based on your goals and package; we'll agree on cadence upfront." },
    ],
    keywords: ["social media marketing agency", "social media management services", "Instagram marketing", "content calendar management"],
  },
  {
    slug: "seo-optimization",
    category: "marketing",
    name: "SEO Optimization",
    shortDescription: "Comprehensive SEO strategy to climb search rankings.",
    description:
      "We improve your organic visibility with technical SEO, keyword-driven content strategy, and structured link building. It's a long-term investment, and we track rankings and traffic transparently so you can see the trajectory clearly.",
    image: "/images/Marketing/3.png",
    features: [
      "On-page & technical SEO",
      "Keyword research and content strategy",
      "Backlink building and audits",
      "Performance tracking & reporting",
    ],
    benefits: [
      { title: "Compounding traffic", description: "Organic rankings keep bringing visitors long after the initial work is done." },
      { title: "Technically sound foundation", description: "Site-speed, crawlability, and structured data fixes remove hidden ranking blockers." },
      { title: "Clear reporting", description: "Monthly rank and traffic reports show exactly where you're gaining ground." },
    ],
    technologies: [
      { name: "Semrush", icon: SiSemrush, color: "#FF6B00" },
      { name: "Google Search Console", icon: FaSearchengin, color: "#34A853" },
      { name: "Yoast SEO", icon: SiYoast, color: "#A4286A" },
      { name: "Google", icon: FaGoogle, color: "#4285F4" },
    ],
    faqs: [
      { question: "How long does SEO take to show results?", answer: "Most sites start seeing meaningful movement within 3–6 months, with compounding results as authority builds over time." },
      { question: "Do you do technical SEO audits?", answer: "Yes, every engagement starts with a technical audit covering site speed, crawlability, indexing, and structured data." },
      { question: "Will you write content too?", answer: "Yes, keyword-driven content strategy and writing is part of our SEO service where it's needed." },
    ],
    keywords: ["SEO agency", "search engine optimization services", "technical SEO audit", "organic traffic growth"],
  },
  {
    slug: "email-marketing",
    category: "marketing",
    name: "Email Marketing",
    shortDescription: "Personalized, automated campaigns that convert and retain.",
    description:
      "We design and run email campaigns that reach the right audience segment with the right message. From welcome sequences to newsletters and automated drip flows, we build systems that nurture leads and keep existing customers coming back.",
    image: "/images/Marketing/4.png",
    features: [
      "Automated drip campaigns",
      "Segmentation & personalization",
      "Newsletter design",
      "Performance analytics",
    ],
    benefits: [
      { title: "Runs on autopilot", description: "Automated sequences nurture new leads without manual follow-up." },
      { title: "More relevant messaging", description: "Segmentation means subscribers get content that's actually relevant to them." },
      { title: "Measurable performance", description: "Open, click, and conversion tracking show exactly what's working." },
    ],
    technologies: [
      { name: "Mailchimp", icon: SiMailchimp, color: "#FFE01B" },
      { name: "HubSpot", icon: SiHubspot, color: "#FF7A59" },
      { name: "WordPress", icon: SiWordpress, color: "#21759B" },
      { name: "Google Docs", icon: SiGoogledocs, color: "#34A853" },
    ],
    faqs: [
      { question: "Can you set up automated welcome and abandoned-cart sequences?", answer: "Yes, we design and configure automated flows including welcome series, abandoned cart, and re-engagement campaigns." },
      { question: "Do you write the email copy?", answer: "Yes, copywriting and design are both included — you review and approve before anything sends." },
      { question: "What platform do you use?", answer: "Most commonly Mailchimp or HubSpot, depending on your existing tools and the complexity of automation needed." },
    ],
    keywords: ["email marketing agency", "email automation services", "newsletter design", "drip campaign setup"],
  },
  {
    slug: "content-marketing",
    category: "marketing",
    name: "Content Marketing",
    shortDescription: "Content strategy that educates, inspires, and converts.",
    description:
      "We create content strategies that build organic authority and move readers toward a decision — from SEO blog posts to video and social content, all planned around a consistent editorial calendar and distributed across the right channels.",
    image: "/images/Marketing/5.png",
    features: [
      "Blog writing and SEO content",
      "Video and visual content production",
      "Content strategy and planning",
      "Cross-channel distribution",
    ],
    benefits: [
      { title: "Builds organic authority", description: "Consistent, well-researched content compounds your search visibility over time." },
      { title: "Reusable across channels", description: "Content is planned to be repurposed across blog, social, and email." },
      { title: "Editorial consistency", description: "A planned content calendar keeps publishing consistent instead of sporadic." },
    ],
    technologies: [
      { name: "Notion", icon: SiNotion, color: "#0b0b0b" },
      { name: "Grammarly", icon: SiGrammarly, color: "#15C39A" },
      { name: "WordPress", icon: SiWordpress, color: "#21759B" },
      { name: "Google Docs", icon: SiGoogledocs, color: "#34A853" },
    ],
    faqs: [
      { question: "Do you research keywords before writing?", answer: "Yes, every piece starts with keyword and topic research so content is written to actually rank and answer real search intent." },
      { question: "Can you write for our existing blog?", answer: "Yes, we can write within your existing site's CMS and style, or help set one up." },
      { question: "How often will you publish?", answer: "Publishing cadence is set in your content calendar based on your goals — weekly and bi-weekly are both common starting points." },
    ],
    keywords: ["content marketing agency", "SEO blog writing services", "content strategy planning", "content marketing services"],
  },
  {
    slug: "influencer-marketing",
    category: "marketing",
    name: "Influencer Marketing",
    shortDescription: "Reach new audiences through trusted creator partnerships.",
    description:
      "We connect brands with creators whose audiences genuinely align with their target customer. From research and outreach to contract management and performance reporting, we handle the full influencer campaign lifecycle.",
    image: "/images/Marketing/6.png",
    features: [
      "Influencer research and outreach",
      "Campaign planning and execution",
      "Contract and deliverable management",
      "Performance measurement and reporting",
    ],
    benefits: [
      { title: "Genuine audience fit", description: "Creators are vetted for real audience alignment, not just follower count." },
      { title: "Managed end-to-end", description: "We handle outreach, contracts, and deliverables so you don't have to chase creators." },
      { title: "Measurable reach", description: "Every campaign is tracked so you know the actual reach and engagement delivered." },
    ],
    technologies: [
      { name: "Upwork", icon: SiUpwork, color: "#6FDA44" },
      { name: "Community Tools", icon: FaUserFriends, color: "#9333EA" },
      { name: "Instagram", icon: SiInstagram, color: "#E4405F" },
      { name: "TikTok", icon: SiTiktok, color: "#0b0b0b" },
    ],
    faqs: [
      { question: "How do you choose which influencers to work with?", answer: "We vet creators for genuine audience overlap with your target customer, not just raw follower count." },
      { question: "Do you negotiate contracts and rates?", answer: "Yes, we handle outreach, negotiation, and deliverable agreements on your behalf." },
      { question: "How is campaign performance reported?", answer: "You get a report covering reach, engagement, and any tracked conversions from each creator partnership." },
    ],
    keywords: ["influencer marketing agency", "creator partnership campaigns", "influencer outreach services", "social media influencer marketing"],
  },

  // ───────────────────────── PHOTOGRAPHY ─────────────────────────
  {
    slug: "product-photography",
    category: "photography",
    name: "Product Photography",
    shortDescription: "High-quality product imagery designed to boost sales.",
    description:
      "Great product photos sell products. We shoot detail-oriented, high-resolution imagery — studio or lifestyle — with lighting and composition dialed in to make your products look their absolute best online and in print.",
    image: "/images/Photography/1.png",
    features: [
      "E-commerce and catalog photography",
      "Studio and lifestyle setups",
      "Lighting and composition perfection",
      "High-resolution product retouching",
    ],
    benefits: [
      { title: "Higher click-through & sales", description: "Sharp, well-lit product images consistently outperform amateur photos on conversion." },
      { title: "Marketplace-ready", description: "Images meet the resolution and background requirements of major marketplaces." },
      { title: "Consistent catalogue look", description: "Every product is shot with the same lighting and style for a cohesive store." },
    ],
    technologies: [
      { name: "Camera", icon: FaCamera, color: "#0b0b0b" },
      { name: "Lightroom", icon: SiAdobe, color: "#31A8FF" },
      { name: "Photoshop", icon: SiAdobe, color: "#31A8FF" },
      { name: "Canva", icon: SiCanva, color: "#00C4CC" },
    ],
    faqs: [
      { question: "Do you shoot on white background for marketplaces?", answer: "Yes, we shoot marketplace-compliant white-background images alongside lifestyle shots if needed." },
      { question: "How many products can you shoot in a session?", answer: "It depends on product complexity — we'll confirm an estimated count and timeline once we know your catalogue." },
      { question: "Is retouching included?", answer: "Yes, color correction, background cleanup, and detail retouching are included on all selected images." },
    ],
    keywords: ["product photography services", "eCommerce product photos", "studio product photography", "catalog photography"],
  },
  {
    slug: "brand-shoots",
    category: "photography",
    name: "Brand Shoots",
    shortDescription: "Conceptual photography that tells your brand's story.",
    description:
      "We help brands communicate their story visually through concept-driven photography. From creative direction to on-location or studio execution, every brand shoot is planned to produce a consistent, recognizable visual identity.",
    image: "/images/Photography/2.png",
    features: [
      "Creative direction and planning",
      "On-location or studio sessions",
      "Professional lighting setup",
      "Consistent visual branding",
    ],
    benefits: [
      { title: "Distinct visual identity", description: "Concept-driven shoots produce imagery that's recognizably yours, not stock-photo generic." },
      { title: "Multi-use assets", description: "A single shoot delivers imagery usable across your website, social, and marketing." },
      { title: "Emotional connection", description: "Story-driven photography connects with your audience beyond just showing a product." },
    ],
    technologies: [
      { name: "Camera Setup", icon: FaPhotoVideo, color: "#111111" },
      { name: "Tripod & Lighting", icon: TbCameraSelfie, color: "#666666" },
      { name: "Photoshop", icon: SiAdobe, color: "#31A8FF" },
      { name: "Lightroom", icon: SiAdobe, color: "#31A8FF" },
    ],
    faqs: [
      { question: "Do you help plan the creative concept?", answer: "Yes, creative direction and shot planning are part of the service — we align on concept before shoot day." },
      { question: "Studio or on-location — which is better?", answer: "It depends on the story you're telling; we'll recommend the setting that fits your brand and budget." },
      { question: "How many final images do we receive?", answer: "Delivery count depends on session length and package; we'll confirm expected deliverables before booking." },
    ],
    keywords: ["brand photography services", "commercial brand shoots", "lifestyle brand photography", "creative photography agency"],
  },
  {
    slug: "event-coverage",
    category: "photography",
    name: "Event Coverage",
    shortDescription: "Professional photo and video coverage for any event.",
    description:
      "From corporate conferences to product launches and celebrations, we capture every key moment with a creative, journalistic eye. Multi-angle coverage and fast turnaround mean you get usable content while the event is still fresh.",
    image: "/images/Photography/3.png",
    features: [
      "Professional event photography team",
      "Multi-angle coverage",
      "Instant on-site editing support",
      "Photo and video package options",
    ],
    benefits: [
      { title: "Nothing missed", description: "A multi-angle team captures key moments without single-camera blind spots." },
      { title: "Fast delivery", description: "On-site editing support means highlight content can go out while the event is still relevant." },
      { title: "Photo + video together", description: "Combined packages give you full coverage without booking two separate teams." },
    ],
    technologies: [
      { name: "Camera", icon: FaCamera, color: "#333333" },
      { name: "Microphone", icon: FaMicrophoneAlt, color: "#999999" },
      { name: "Premiere Pro", icon: SiAdobe, color: "#9999FF" },
      { name: "DaVinci Resolve", icon: SiDavinciresolve, color: "#223FFF" },
    ],
    faqs: [
      { question: "How many photographers cover an event?", answer: "Team size scales with event size — we'll recommend coverage based on venue, duration, and number of moments to capture." },
      { question: "Can we get same-day highlight photos?", answer: "Yes, we offer on-site or rapid-turnaround editing for a same-day highlight selection." },
      { question: "Do you cover corporate and personal events both?", answer: "Yes, from corporate conferences and product launches to personal celebrations." },
    ],
    keywords: ["event photography services", "corporate event coverage", "event videography", "conference photography"],
  },
  {
    slug: "video-production",
    category: "photography",
    name: "Video Production",
    shortDescription: "Full-scale video production from concept to final edit.",
    description:
      "We handle the full video production pipeline — concept, scripting, filming, and post-production — to deliver cinematic content that tells your story. Whether it's a brand film or a product video, every stage is handled in-house.",
    image: "/images/Photography/4.png",
    features: [
      "Concept, scripting, and storyboarding",
      "4K filming and direction",
      "Professional color grading",
      "Sound design and motion graphics",
    ],
    benefits: [
      { title: "One team, full pipeline", description: "Concept through final edit handled by one team — no coordinating separate vendors." },
      { title: "Cinematic quality", description: "4K filming, color grading, and sound design produce a genuinely polished final product." },
      { title: "Story-first approach", description: "Scripting and storyboarding ensure the video actually communicates, not just looks nice." },
    ],
    technologies: [
      { name: "Filming", icon: FaVideo, color: "#0b0b0b" },
      { name: "Premiere Pro", icon: SiAdobe, color: "#9999FF" },
      { name: "After Effects", icon: SiAdobe, color: "#D291FF" },
      { name: "DaVinci Resolve", icon: SiDavinciresolve, color: "#223FFF" },
    ],
    faqs: [
      { question: "Do you write the script and storyboard?", answer: "Yes, scripting and storyboarding are part of the process, or we can work from a script you already have." },
      { question: "What video length do you typically produce?", answer: "It depends on the use case — brand films, product videos, and social cuts all have different ideal lengths, which we'll advise on." },
      { question: "Is color grading and sound design included?", answer: "Yes, professional color grading and sound design are included in the post-production process." },
    ],
    keywords: ["video production company", "corporate video production", "brand video production", "commercial video services"],
  },
  {
    slug: "photo-editing-retouching",
    category: "photography",
    name: "Photo Editing & Retouching",
    shortDescription: "Expert retouching that enhances every shot to perfection.",
    description:
      "We bring every shot to its best version through careful color correction, compositing, and digital retouching — enhancing natural detail without over-processing, and delivering files ready for web or print.",
    image: "/images/Photography/5.png",
    features: [
      "High-end retouching",
      "Color grading and tone balance",
      "Image compositing and cleanup",
      "Batch export for web & print",
    ],
    benefits: [
      { title: "Polished final images", description: "Professional retouching elevates good photos into publish-ready assets." },
      { title: "Consistent tone", description: "Color grading keeps a whole shoot's images looking like a cohesive set." },
      { title: "Ready for every channel", description: "Batch exports are prepared in the sizes and formats each platform needs." },
    ],
    technologies: [
      { name: "Photoshop", icon: SiAdobe, color: "#31A8FF" },
      { name: "Lightroom", icon: SiAdobe, color: "#31A8FF" },
      { name: "After Effects", icon: SiAdobe, color: "#D291FF" },
      { name: "Color Tools", icon: MdOutlineColorLens, color: "#F5B041" },
    ],
    faqs: [
      { question: "Can you edit photos we already shot ourselves?", answer: "Yes, we retouch and color-grade existing photos, not just ones from shoots we produced." },
      { question: "Do you offer batch editing for large photo sets?", answer: "Yes, we handle bulk editing with consistent tone and quality across the full set." },
      { question: "What formats do you deliver?", answer: "Web-optimized and print-ready formats, sized and exported for whichever channels you need." },
    ],
    keywords: ["photo retouching services", "professional photo editing", "product photo editing", "batch photo editing"],
  },
  {
    slug: "drone-photography",
    category: "photography",
    name: "Drone Photography",
    shortDescription: "Cinematic aerial imagery for real estate, events, and brand films.",
    description:
      "Aerial footage adds a perspective ground-level cameras simply can't. Our licensed drone operators capture 4K aerial photo and video for real estate, events, and creative brand content, fully edited and color-graded for delivery.",
    image: "/images/Photography/6.png",
    features: [
      "4K aerial photo and video",
      "Licensed drone operators",
      "Dynamic FPV shots",
      "Post-production editing and color work",
    ],
    benefits: [
      { title: "A perspective nothing else gives", description: "Aerial shots add scale and cinematic quality unavailable from ground cameras." },
      { title: "Fully licensed", description: "Operations follow proper licensing and airspace regulations, so there's no compliance risk on your end." },
      { title: "Edit-ready footage", description: "Delivered footage is color-graded and edited, not just raw drone clips." },
    ],
    technologies: [
      { name: "Drone", icon: TbDrone, color: "#111111" },
      { name: "Camera", icon: FaCamera, color: "#444444" },
      { name: "Premiere Pro", icon: SiAdobe, color: "#9999FF" },
      { name: "DaVinci Resolve", icon: SiDavinciresolve, color: "#223FFF" },
    ],
    faqs: [
      { question: "Are your drone operators licensed?", answer: "Yes, all aerial work is carried out by licensed operators following applicable airspace regulations." },
      { question: "What's drone photography best used for?", answer: "Real estate, events, construction progress, and brand films are the most common use cases we shoot for." },
      { question: "Do you deliver both raw and edited footage?", answer: "We deliver fully edited, color-graded footage; raw files can be provided on request." },
    ],
    keywords: ["drone photography services", "aerial videography", "real estate drone photography", "aerial brand film"],
  },

  // ───────────────────────── AI SERVICES ─────────────────────────
  {
    slug: "ai-automation",
    category: "ai",
    name: "AI Automation",
    shortDescription: "Automate workflows with AI agents, APIs, and automation platforms.",
    description:
      "We automate the repetitive parts of your operations — data entry, reporting, CRM updates — using AI agents and automation platforms. The goal is simple: give your team back hours every week without adding headcount.",
    image: "/images/ai/1.png",
    features: [
      "Process automation with AI agents",
      "Data entry & reporting automation",
      "Email & CRM automation",
      "Custom workflow creation",
    ],
    benefits: [
      { title: "Hours saved weekly", description: "Repetitive manual tasks get handled automatically, freeing your team for higher-value work." },
      { title: "Fewer human errors", description: "Automated data entry and reporting reduce the mistakes manual processes introduce." },
      { title: "Fits your existing tools", description: "Automations connect to the CRM, email, and platforms you already use." },
    ],
    technologies: [
      { name: "Zapier", icon: SiZapier, color: "#FF4A00" },
      { name: "Make.com", icon: FaCogs, color: "#0B84F3" },
      { name: "OpenAI", icon: SiOpenai, color: "#15AABF" },
      { name: "Google Cloud AI", icon: SiGooglecloud, color: "#4285F4" },
    ],
    faqs: [
      { question: "What kinds of tasks can actually be automated?", answer: "Data entry, report generation, email triage, CRM updates, and multi-step workflows across tools you already use are the most common wins." },
      { question: "Do we need technical staff to maintain the automation?", answer: "No — we build and document the workflows, and offer ongoing support as your processes evolve." },
      { question: "How is ROI measured?", answer: "We estimate hours saved per week upfront, then track actual usage to confirm the automation is delivering that value." },
    ],
    keywords: ["AI automation services", "workflow automation agency", "business process automation", "AI agent integration"],
  },
  {
    slug: "social-media-automation",
    category: "ai",
    name: "AI Social Media Automation",
    shortDescription: "Auto-posting, AI content, and smart scheduling to stay active 24/7.",
    description:
      "We set up systems that keep your social presence active without daily manual effort — AI-assisted content generation, auto-posting schedules, and safe engagement automation that runs in the background while you focus on the business.",
    image: "/images/ai/2.png",
    features: [
      "Auto-posting systems",
      "AI-generated posts & captions",
      "Safe engagement automation",
      "Growth & analytics automation",
    ],
    benefits: [
      { title: "Always active", description: "Scheduled auto-posting keeps your accounts consistent, even on busy weeks." },
      { title: "Faster content production", description: "AI-assisted drafts speed up caption and post writing without losing your voice." },
      { title: "Safe by design", description: "Engagement automation is configured within platform limits to avoid account risk." },
    ],
    technologies: [
      { name: "ChatGPT", icon: SiOpenai, color: "#15AABF" },
      { name: "Meta API", icon: FaRobot, color: "#1C1C1C" },
      { name: "Zapier", icon: SiZapier, color: "#FF4A00" },
      { name: "Buffer AI", icon: FaCogs, color: "#6F42C1" },
    ],
    faqs: [
      { question: "Will AI-generated posts sound like our brand?", answer: "Yes, we train prompts and templates around your brand voice and review output before it's scheduled." },
      { question: "Is auto-posting safe for our accounts?", answer: "Yes, we use official platform APIs and stay within their rate limits to avoid any account risk." },
      { question: "Can we still approve content before it goes live?", answer: "Yes, we can set up an approval step in the workflow if you want to review before publishing." },
    ],
    keywords: ["AI social media automation", "automated social media posting", "AI content generation", "social media scheduling automation"],
  },
  {
    slug: "ai-chatbots",
    category: "ai",
    name: "AI Chatbots",
    shortDescription: "Trained chatbots for your website, WhatsApp, and CRM.",
    description:
      "We build AI chatbots trained on your actual business data — for your website, WhatsApp, or Facebook — that answer real customer questions, qualify leads, and hand off to your team when a human is needed.",
    image: "/images/ai/3.png",
    features: [
      "WhatsApp AI chatbots",
      "Website AI assistants",
      "Custom RAG-trained bots",
      "CRM-integrated support agents",
    ],
    benefits: [
      { title: "24/7 first response", description: "Customers get instant answers outside business hours instead of waiting for a reply." },
      { title: "Trained on your data", description: "RAG-based training means answers are grounded in your actual documentation, not generic guesses." },
      { title: "Qualifies leads automatically", description: "The bot filters and routes leads before they reach your sales team." },
    ],
    technologies: [
      { name: "Botpress", icon: FaRobot, color: "#00B8D9" },
      { name: "OpenAI GPT", icon: SiOpenai, color: "#15AABF" },
      { name: "Meta AI", icon: FaRobot, color: "#0b0b0b" },
      { name: "Dialogflow", icon: SiGooglecloud, color: "#4285F4" },
    ],
    faqs: [
      { question: "Can the chatbot handle WhatsApp as well as our website?", answer: "Yes, we build chatbots for WhatsApp, website widgets, and Facebook Messenger, connected to the same knowledge base." },
      { question: "How does it stay accurate to our business?", answer: "We use RAG (retrieval-augmented generation) trained on your docs, FAQs, and product data so answers stay grounded in fact." },
      { question: "What happens when the bot can't answer?", answer: "It hands off to a human team member with the conversation context, so customers never hit a dead end." },
    ],
    keywords: ["AI chatbot development", "WhatsApp chatbot for business", "website AI assistant", "custom RAG chatbot"],
  },
  {
    slug: "ai-website-integration",
    category: "ai",
    name: "AI Website Integration",
    shortDescription: "Embed AI chat, search, and recommendations into your website.",
    description:
      "We integrate AI directly into your website's experience — smart search, personalized product recommendations, and chat assistants — connected through custom APIs so the AI actually understands your content and catalogue.",
    image: "/images/ai/4.png",
    features: [
      "AI chat widget",
      "Smart product recommendations",
      "AI-based search systems",
      "Custom API integrations",
    ],
    benefits: [
      { title: "Smarter search", description: "AI-based search understands intent, not just exact keyword matches." },
      { title: "Personalized experience", description: "Recommendations tailored to browsing behavior increase engagement and sales." },
      { title: "Fully integrated", description: "Built through custom APIs so AI features feel native to your site, not bolted on." },
    ],
    technologies: [
      { name: "OpenAI API", icon: SiOpenai, color: "#15AABF" },
      { name: "Next.js", icon: MdIntegrationInstructions, color: "#333333" },
      { name: "Pinecone Vector DB", icon: FaCogs, color: "#0B84F3" },
      { name: "LangChain", icon: FaRobot, color: "#444444" },
    ],
    faqs: [
      { question: "Can this work with our existing website?", answer: "Yes, we integrate AI features into existing sites through APIs — no full rebuild required in most cases." },
      { question: "How does AI search differ from normal search?", answer: "AI-based search understands meaning and intent, so it returns relevant results even when the exact keywords don't match." },
      { question: "Is our data used to train public AI models?", answer: "No, integrations are built to keep your data private and used only within your own application." },
    ],
    keywords: ["AI website integration", "AI powered search", "AI product recommendations", "custom AI API integration"],
  },
  {
    slug: "aeo-ai-enablement",
    category: "ai",
    name: "AEO — AI Enablement",
    shortDescription: "A complete AI roadmap to increase efficiency and revenue.",
    description:
      "Not sure where AI actually fits in your business? We audit your operations, identify where automation and AI can realistically move the needle, and deliver a practical roadmap — including AEO (Answer Engine Optimization) so your business shows up in AI-powered search and assistants.",
    image: "/images/ai/5.png",
    features: [
      "AI audit for your business",
      "Automation suggestions",
      "AI tools setup",
      "Growth plan using AI",
    ],
    benefits: [
      { title: "Clear priorities, not hype", description: "The audit identifies where AI will actually pay off, instead of chasing every trend." },
      { title: "Future-ready visibility", description: "AEO positions your content to be surfaced by AI assistants and answer engines, not just traditional search." },
      { title: "A roadmap you can act on", description: "You leave with a prioritized, practical plan — not just a slide deck of ideas." },
    ],
    technologies: [
      { name: "AI Audit Tools", icon: FaSearch, color: "#1C7ED6" },
      { name: "Custom AI Strategy", icon: FaCogs, color: "#4b35ff" },
      { name: "Workflow Automation", icon: SiZapier, color: "#FF4A00" },
      { name: "GPT Solutions", icon: SiOpenai, color: "#15AABF" },
    ],
    faqs: [
      { question: "What is AEO (Answer Engine Optimization)?", answer: "AEO is optimizing your content so AI assistants and answer engines (like ChatGPT search or Google's AI overviews) can find, understand, and cite your business accurately." },
      { question: "What does an AI audit actually involve?", answer: "We review your current workflows, tools, and content to identify realistic, high-impact opportunities for AI and automation." },
      { question: "Do you implement the roadmap or just deliver a plan?", answer: "Both — we can hand over a prioritized roadmap, or implement the recommended automations and AEO work directly." },
    ],
    keywords: ["AI enablement consulting", "AEO answer engine optimization", "AI audit for business", "AI strategy roadmap"],
  },
  {
    slug: "ai-video-automation",
    category: "ai",
    name: "AI Video Automation",
    shortDescription: "Bulk video creation — script, voiceover, editing, and publishing.",
    description:
      "We build AI-assisted video pipelines for teams that need to publish consistently — scripting, AI voiceovers, auto-editing workflows, and scheduled publishing to YouTube and TikTok, so content production scales without a full video team.",
    image: "/images/ai/6.png",
    features: [
      "Bulk video generation",
      "AI voiceovers",
      "Auto-editing workflows",
      "YouTube & TikTok automation",
    ],
    benefits: [
      { title: "Scales content output", description: "Bulk generation workflows produce far more video than a manual pipeline could sustain." },
      { title: "Lower production cost", description: "AI voiceovers and auto-editing cut the cost of consistent video content." },
      { title: "Publishes itself", description: "Scheduled automation pushes finished videos to YouTube and TikTok without manual uploads." },
    ],
    technologies: [
      { name: "Pika Labs", icon: FaVideo, color: "#F03E3E" },
      { name: "Runway ML", icon: FaVideo, color: "#0b0b0b" },
      { name: "CapCut AI", icon: FaCogs, color: "#0B84F3" },
      { name: "ElevenLabs", icon: FaRobot, color: "#0b0b0b" },
    ],
    faqs: [
      { question: "Do AI voiceovers sound natural?", answer: "Yes, modern AI voice tools produce natural-sounding narration, and we select voices that fit your brand tone." },
      { question: "Can this publish directly to YouTube and TikTok?", answer: "Yes, we set up scheduled publishing automation so finished videos go out without manual uploading." },
      { question: "How many videos can this pipeline produce?", answer: "Volume depends on your content plan — the pipeline is built to scale well beyond what a manual process could sustain." },
    ],
    keywords: ["AI video automation", "AI video production", "automated video editing", "bulk video content creation"],
  },
];

export function getServicesByCategory(category: ServiceCategorySlug): ServiceDefinition[] {
  return SERVICES.filter((service) => service.category === category);
}

export function getService(category: string, slug: string): ServiceDefinition | undefined {
  return SERVICES.find((service) => service.category === category && service.slug === slug);
}

export function getServicePath(service: Pick<ServiceDefinition, "category" | "slug">): string {
  return `/Services/${service.category}/${service.slug}`;
}

/** Other services in the same category, for the "Related Services" section. */
export function getRelatedServices(service: ServiceDefinition, count = 3): ServiceDefinition[] {
  const siblings = getServicesByCategory(service.category).filter((s) => s.slug !== service.slug);
  return siblings.slice(0, count);
}

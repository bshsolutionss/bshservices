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
    shortDescription: "An ecommerce development company building Shopify, WooCommerce, and custom online stores that turn visitors into paying customers.",
    description:
      "Ecommerce development is the process of planning, building, and maintaining the technical and design foundation that lets you sell products online — from the storefront and inventory systems to secure payment gateways and hosting. As a full-service ecommerce web development company, we manage strategy, design, development, testing, and post-launch support under one roof, so your store is built with conversion in mind from the very first wireframe.",
    image: "/images/development/2.png",
    features: [
      "Shopify Ecommerce Development",
      "WooCommerce Development Services",
      "Custom Ecommerce Platform Development",
      "Marketplace Website Development",
      "Ecommerce Website Redesign",
      "Ecommerce Website Maintenance",
    ],
    benefits: [
      { title: "Built for conversion, not just launch", description: "Your store is built with conversion in mind from the very first wireframe, not handed over as a generic template with your logo added on top." },
      { title: "One accountable team", description: "Strategy, design, development, and support all happen under one roof instead of juggling separate vendors for design, development, and hosting." },
      { title: "Security and speed as the foundation", description: "Secure checkout, encrypted payment processing, and speed-optimized builds keep customers moving smoothly toward checkout instead of losing patience." },
    ],
    technologies: [
      { name: "Shopify", icon: SiShopify, color: "#96BF48" },
      { name: "WordPress", icon: SiWordpress, color: "#21759B" },
      { name: "WooCommerce", icon: SiWoocommerce, color: "#96588A" },
      { name: "Stripe", icon: SiStripe, color: "#635BFF" },
      { name: "PayPal", icon: SiPaypal, color: "#00457C" },
    ],
    faqs: [
      { question: "How long does it take to build an online store?", answer: "Most small to mid sized stores take between four and eight weeks from planning to launch, depending on the number of products, custom features, and integrations involved. Larger custom ecommerce platforms or marketplace builds typically take longer. We provide a realistic timeline at the start of every project." },
      { question: "Which platform is best for my online store, Shopify or WooCommerce?", answer: "It depends on your business. Shopify ecommerce development tends to suit businesses that want a fully managed, scalable platform with less technical maintenance. Woocommerce development services tend to suit businesses that already use WordPress or want more flexibility and control over hosting and customization. We help you decide based on your specific catalog and growth plans rather than a generic recommendation." },
      { question: "Do I need custom ecommerce development or is a template enough?", answer: "If your business has straightforward product needs, a well built template on a platform like Shopify can work well. If you need unique pricing rules, complex integrations, or a highly specific checkout experience, custom ecommerce development is usually the better long term choice." },
      { question: "Do you build marketplace websites with multiple sellers?", answer: "Yes. Marketplace website development is one of our specialized services, covering vendor onboarding, commission tracking, individual vendor dashboards, and centralized order management across all sellers on the platform." },
      { question: "Can you help redesign my existing online store instead of starting over?", answer: "Yes. Our ecommerce website redesign service is built for stores that already have traffic and sales but need a faster, more modern, and better converting experience without losing existing SEO rankings or customer data." },
      { question: "Do you offer ongoing support after the store launches?", answer: "Yes. Ecommerce website maintenance is one of our core services, covering security updates, performance monitoring, and technical support so your store continues running smoothly as your business grows." },
    ],
    keywords: ["ecommerce development company", "shopify ecommerce development", "woocommerce development services", "custom ecommerce platform development", "marketplace website development", "ecommerce website redesign"],
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
    shortDescription: "A custom software development company building CRMs, ERPs, and SaaS platforms shaped entirely around how your business actually works.",
    description:
      "Custom software development is the process of designing, building, and maintaining software created specifically for one business rather than sold as a generic product to many different companies — shaped around your actual workflows, terminology, and data instead of forcing your team to adapt to generic settings. As a full-service custom software development agency, we manage discovery, design, development, testing, and long-term support ourselves, giving you one accountable team instead of coordinating separate vendors.",
    image: "/images/development/4.png",
    features: [
      "Custom CRM Development",
      "Custom ERP Development",
      "SaaS Development Services",
      "Cloud Software Development",
      "Web Based Software Development",
      "Software Product Development",
    ],
    benefits: [
      { title: "Built around your process", description: "The workflows, terminology, and features reflect your actual processes, not a generic template every other business uses." },
      { title: "One accountable team", description: "Discovery, design, development, testing, and long-term support all happen under one roof." },
      { title: "You own what we build", description: "Well built custom software can be updated and expanded as your needs change, and maintenance is built specifically to handle those ongoing adjustments." },
    ],
    technologies: [
      { name: "Node.js", icon: SiNodedotjs, color: "#339933" },
      { name: "Python", icon: SiPython, color: "#3776AB" },
      { name: "Java", icon: FaJava, color: "#007396" },
      { name: ".NET", icon: SiDotnet, color: "#512BD4" },
    ],
    faqs: [
      { question: "How long does custom software development take?", answer: "Timelines vary significantly depending on complexity. A focused internal tool might take six to ten weeks, while a full custom platform, ERP system, or SaaS product can take several months. We provide a realistic timeline based on your specific scope after an initial discovery conversation." },
      { question: "Is custom software worth the cost compared to off the shelf tools?", answer: "It depends on your specific situation. If your processes fit well within a generic tool, off the shelf software is often the more cost effective choice. If your business has unique workflows that generic software cannot properly support, the long term savings from eliminating inefficiencies and workarounds often outweigh the higher upfront investment in custom software." },
      { question: "Can custom software integrate with tools we already use?", answer: "Yes. Most custom software projects are built to integrate with existing systems, whether that means accounting software, email platforms, payment processors, or other business tools your team already relies on." },
      { question: "Do you build software for specific industries?", answer: "Yes. Custom business software can be built for nearly any industry, since the entire point of a custom approach is designing around the specific needs of your business rather than a generic, one size fits all structure." },
      { question: "What happens if our business needs change after the software is built?", answer: "This is exactly why scalable software solutions and proper architecture planning matter from the beginning. Well built custom software can be updated and expanded as your needs change, and our software maintenance and support services are built specifically to handle these ongoing adjustments." },
    ],
    keywords: ["custom software development company", "custom CRM development", "custom ERP development", "SaaS development services", "cloud software development", "software consulting services"],
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
    shortDescription: "A branding agency that builds brand strategy, identity design, and guidelines people actually remember.",
    description:
      "Branding is more than a logo — it's the complete impression your business leaves, from your name and visual identity to your tone of voice and the experience customers have with you. As a full-service branding agency, we start with brand strategy and positioning, then bring it to life through logo, color palette, typography, and documented brand guidelines, so your identity feels consistent and intentional everywhere your audience encounters it.",
    image: "/images/Designing/1.png",
    features: [
      "Brand strategy and positioning",
      "Complete branding solutions (strategy, identity & messaging)",
      "Startup and small business branding",
      "Rebranding services that preserve existing brand equity",
      "Brand guidelines and visual identity documentation",
      "Digital branding across web and social",
    ],
    benefits: [
      { title: "Strategy before design", description: "Every visual decision is grounded in real brand positioning and audience research, not guesswork." },
      { title: "One accountable team", description: "Strategy, identity design, and messaging happen under one roof, so your brand feels cohesive instead of stitched together by different vendors." },
      { title: "Consistency that lasts", description: "Documented brand guidelines keep your identity consistent everywhere — website, social, print, and packaging — no matter who applies it." },
    ],
    technologies: [
      { name: "Adobe Illustrator", icon: SiAdobe, color: "#FF9A00" },
      { name: "Adobe Photoshop", icon: SiAdobe, color: "#31A8FF" },
      { name: "Figma", icon: SiFigma, color: "#F24E1E" },
      { name: "Canva", icon: SiCanva, color: "#00C4CC" },
    ],
    faqs: [
      { question: "How long does a branding project typically take?", answer: "Most complete branding projects take between six and ten weeks, depending on scope, while smaller projects like a brand guidelines refresh or a focused logo update can move faster. We provide a realistic timeline based on your specific project after an initial conversation." },
      { question: "Do I need a full rebrand, or would a smaller refresh work?", answer: "It depends on your specific situation. If your core positioning and strategy still fit your business well, a focused visual refresh may be enough. If your business has genuinely outgrown its original identity or positioning, a more complete rebrand is usually the better long term choice." },
      { question: "What is included in brand guidelines?", answer: "Brand guidelines typically include logo usage rules, color specifications, typography, imagery style, and guidance on tone of voice, giving anyone working on your brand a clear reference for staying consistent across every application." },
      { question: "Can branding really impact how well my business performs?", answer: "Yes. A clear, consistent brand builds trust faster, makes your business easier to remember, and helps you stand out in a crowded market. Businesses with strong, consistent branding are generally better positioned to attract and retain customers than those with an inconsistent or unclear identity." },
      { question: "Do you work with startups that do not have an established audience yet?", answer: "Yes. Startup branding services are built specifically for businesses at this stage, using market research and audience insight to build a strong foundation even before a business has an established customer base to draw direct feedback from." },
    ],
    keywords: ["branding agency", "brand identity design", "brand strategy services", "corporate branding services", "rebranding services", "brand guidelines design", "startup branding services", "small business branding"],
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
    shortDescription: "A content marketing agency building SEO content strategy, blog writing, and website copy that actually drives business growth.",
    description:
      "Content marketing services cover the full process of planning, creating, publishing, and measuring content designed to attract, engage, and convert a target audience — content strategy, SEO content writing, blog writing, and website copy, plus ongoing optimization based on how content actually performs once it's live. As a full-service digital content marketing agency, we handle strategy, writing, optimization, and distribution all under one roof, so your content program stays cohesive instead of fragmented across separate vendors.",
    image: "/images/Marketing/5.png",
    features: [
      "Content Strategy Services",
      "Blog Writing Services",
      "Website Content Writing Services",
      "Copywriting Services",
      "Content Development Services",
      "Content Distribution Services",
    ],
    benefits: [
      { title: "Strategy before writing", description: "Every piece connects to a broader, coordinated plan instead of existing as a disconnected, one-off article." },
      { title: "Written to actually rank", description: "SEO content writing balances genuine keyword research with strong writing, so content is structured for search engines without sacrificing readability." },
      { title: "Tracked and improved over time", description: "Content performance is tracked continuously, with underperforming pieces updated based on real data rather than left unattended." },
    ],
    technologies: [
      { name: "Notion", icon: SiNotion, color: "#0b0b0b" },
      { name: "Grammarly", icon: SiGrammarly, color: "#15C39A" },
      { name: "WordPress", icon: SiWordpress, color: "#21759B" },
      { name: "Google Docs", icon: SiGoogledocs, color: "#34A853" },
    ],
    faqs: [
      { question: "How long does it take to see results from content marketing?", answer: "Content marketing generally builds gradually, with many businesses seeing meaningful traffic and engagement improvements within three to six months of consistent publishing, though results depend heavily on competition and how well previous content was optimized before this point." },
      { question: "How often should we be publishing new content?", answer: "This depends on your specific goals and resources, but consistency matters more than sheer volume. We help determine a realistic, sustainable publishing cadence based on your specific situation rather than an arbitrary, generic number." },
      { question: "Do you write content for our specific industry?", answer: "Yes. Our writers research each topic and industry thoroughly, ensuring content reflects genuine understanding rather than generic, surface level information that could apply to almost any business." },
      { question: "What is the difference between content marketing and copywriting?", answer: "Content marketing typically focuses on longer form, educational material designed to attract and engage an audience over time, while copywriting tends to focus on shorter, more direct content specifically designed to drive an immediate action, like a landing page or advertisement." },
      { question: "Can you improve content we already have instead of starting from scratch?", answer: "Yes. Content optimization services are a core part of what we offer, reviewing and improving existing content to better serve both readers and search engines rather than requiring an entirely new content library built from the ground up." },
    ],
    keywords: ["content marketing agency", "SEO content writing", "content strategy services", "blog writing services", "website content writing", "copywriting services"],
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
    shortDescription: "A brand photography company capturing genuine, custom imagery that shows your real people, spaces, and personality.",
    description:
      "Brand photography covers imagery specifically created to represent a business's identity, culture, and personality — team portraits, workspace imagery, and styled shots that communicate a brand's specific tone, rather than relying on generic stock photos other businesses are also using. As a full-service brand photoshoot agency, we handle concept development, planning, photography, and editing all under one roof, keeping your visual content genuinely aligned with your brand.",
    image: "/images/Photography/2.png",
    features: [
      "Corporate Brand Photography",
      "Personal Brand Photography",
      "Business Photoshoot Services",
      "Brand Content Photography",
      "Ecommerce Brand Photography",
      "Brand Campaign Photography",
    ],
    benefits: [
      { title: "Genuinely authentic, not stock", description: "Custom imagery reflects your real people and personality instead of the same generic photos countless other businesses are also using." },
      { title: "Directed for natural results", description: "We help non-professional subjects feel genuinely comfortable in front of the camera, which produces more authentic images than forced, overly posed photography." },
      { title: "Versatile across every channel", description: "A single shoot delivers a genuinely versatile image library suitable for your website, social media, and marketing materials." },
    ],
    technologies: [
      { name: "Camera Setup", icon: FaPhotoVideo, color: "#111111" },
      { name: "Tripod & Lighting", icon: TbCameraSelfie, color: "#666666" },
      { name: "Photoshop", icon: SiAdobe, color: "#31A8FF" },
      { name: "Lightroom", icon: SiAdobe, color: "#31A8FF" },
    ],
    faqs: [
      { question: "How long does a typical brand photoshoot take?", answer: "This depends on scope, but many brand shoots are completed within a single half day or full day session, while larger projects covering multiple locations or a broader range of content may take longer." },
      { question: "What is the difference between brand photography and product photography?", answer: "Brand photography focuses on people, culture, and overall business identity, while product photography focuses specifically and narrowly on individual products, typically for ecommerce listings or catalogs." },
      { question: "Our team is not comfortable in front of a camera, can you still get good results?", answer: "Yes. A significant part of our process involves helping non professional subjects feel genuinely comfortable and natural, which often produces more authentic, effective images than forced, overly posed photography." },
      { question: "How many images will we receive from a brand photoshoot?", answer: "This depends on the specific package and shoot length, but most projects deliver a versatile set of edited images suitable for use across multiple channels, from your website to social media and marketing materials." },
      { question: "Can you photograph our team at our actual office or business location?", answer: "Yes. On location photography is common for brand shoots, since capturing your actual workspace and environment often adds genuine authenticity that a studio setting cannot fully replicate." },
    ],
    keywords: ["brand photography company", "corporate brand photography", "personal brand photography", "brand content photography", "ecommerce brand photography", "brand photoshoot agency"],
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
    shortDescription: "A licensed drone photography service capturing real estate, construction, corporate, and event footage from a perspective ground cameras can't reach.",
    description:
      "Professional drone photography and videography covers the operation of unmanned aerial vehicles to capture images and video from perspectives that would otherwise be impossible or prohibitively expensive to achieve through ground-based photography alone — with proper flight planning, licensing, and genuine piloting skill behind every shot. As a full-service drone photography provider, we handle flight planning, capture, and post-production all under one roof, keeping your aerial content cohesive and genuinely professional.",
    image: "/images/Photography/6.png",
    features: [
      "Real Estate Drone Photography",
      "Construction Drone Photography",
      "Corporate Drone Photography",
      "Event Drone Coverage",
      "Cinematic Drone Videography",
      "Aerial Video Production",
    ],
    benefits: [
      { title: "Properly licensed, not a risk", description: "Commercial drone operation requires proper certification, and we operate fully within relevant regulations, so your project is completed legally and safely." },
      { title: "A perspective ground cameras can't reach", description: "Aerial shots show a property, site, or event's full context and scale in a way ground-level photography alone can't capture." },
      { title: "Edit-ready, not raw clips", description: "Captured footage and images go through editing and post-production to meet a genuinely professional, polished standard before delivery." },
    ],
    technologies: [
      { name: "Drone", icon: TbDrone, color: "#111111" },
      { name: "Camera", icon: FaCamera, color: "#444444" },
      { name: "Premiere Pro", icon: SiAdobe, color: "#9999FF" },
      { name: "DaVinci Resolve", icon: SiDavinciresolve, color: "#223FFF" },
    ],
    faqs: [
      { question: "Is commercial drone photography legal, and are you properly licensed?", answer: "Yes. Commercial drone operation requires proper licensing and certification, and we operate fully within relevant regulations, ensuring your project is completed legally and safely." },
      { question: "What weather conditions affect drone photography?", answer: "Wind, rain, and lighting conditions can all affect drone photography and flight safety. We plan around weather conditions carefully, sometimes requiring flexible scheduling to ensure the best possible conditions for your specific shoot." },
      { question: "Can you fly drones near event crowds or in urban areas?", answer: "This depends on specific regulations and location, and requires careful planning and appropriate permissions. We assess these considerations during initial planning to determine what is safely and legally possible for your specific project and location." },
      { question: "How is drone photography different from real estate photography we might already have?", answer: "Drone photography captures aerial perspectives showing a property's full context and surroundings, complementing ground level and interior photography rather than replacing it, giving potential buyers a more complete overall picture." },
      { question: "Do you offer ongoing coverage for long term projects like construction?", answer: "Yes. Construction drone photography is often provided on an ongoing basis throughout a project's timeline, delivering consistent, comparable documentation of progress over an extended period." },
    ],
    keywords: ["drone photography service", "commercial drone photography", "real estate drone photography", "construction drone photography", "event drone coverage", "cinematic drone videography"],
  },

  // ───────────────────────── AI SERVICES ─────────────────────────
  {
    slug: "ai-automation",
    category: "ai",
    name: "AI Automation",
    shortDescription: "An AI automation agency building workflow automation and AI agents that give your team back real time.",
    description:
      "AI automation services cover the design, development, and implementation of systems that use artificial intelligence and workflow automation to handle tasks that previously required manual human effort — from straightforward workflow automation to more sophisticated AI that can interpret unstructured information and make contextual decisions. As a full-service AI automation agency, we handle discovery, solution design, development, and ongoing monitoring all under one roof, so your automation strategy stays cohesive and accountable.",
    image: "/images/ai/1.png",
    features: [
      "Business Process Automation",
      "Workflow Automation Services",
      "AI Agent Development",
      "Custom AI Automation",
      "No Code AI Automation",
      "Enterprise AI Automation",
    ],
    benefits: [
      { title: "Built around your actual process", description: "Custom AI automation is built specifically around your actual workflows and systems, not a generic automation template." },
      { title: "Tested before it touches real work", description: "Automation is thoroughly tested against realistic scenarios, including edge cases, before it starts handling real business processes." },
      { title: "Honest about what's worth automating", description: "We recommend the right level of sophistication for each situation, rather than defaulting to complex AI where simpler automation is actually more reliable." },
    ],
    technologies: [
      { name: "Zapier", icon: SiZapier, color: "#FF4A00" },
      { name: "Make.com", icon: FaCogs, color: "#0B84F3" },
      { name: "OpenAI", icon: SiOpenai, color: "#15AABF" },
      { name: "Google Cloud AI", icon: SiGooglecloud, color: "#4285F4" },
    ],
    faqs: [
      { question: "How do we know which processes are actually worth automating?", answer: "This depends on how frequently a process occurs, how much time it currently consumes, and how consistently it follows a predictable pattern. We help identify and prioritize opportunities during an initial consultation based on realistic potential return on investment." },
      { question: "Is AI automation only for large enterprises, or does it make sense for small businesses too?", answer: "AI automation for small business is genuinely valuable when applied thoughtfully to the right processes. Smaller businesses often see meaningful, measurable benefit from automating even a single well chosen, high impact task." },
      { question: "What happens if an automated process encounters something unexpected?", answer: "Well designed automation includes proper handling for exceptions and edge cases, either resolving them appropriately or flagging them for human review rather than failing silently or producing incorrect results." },
      { question: "How long does it take to implement AI automation?", answer: "Timelines vary based on complexity. A focused, single process automation might take a few weeks, while more complex, multi system automation projects typically take longer. We provide a realistic timeline based on your specific scope after an initial discovery conversation." },
      { question: "Do you offer ongoing support after automation is implemented?", answer: "Yes. Automated systems benefit from ongoing monitoring and occasional adjustment as your business and connected systems evolve over time, and we offer support to keep your automation performing reliably well beyond initial implementation." },
    ],
    keywords: ["AI automation agency", "business process automation", "workflow automation services", "AI agent development", "custom AI automation", "enterprise AI automation"],
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
    shortDescription: "An AI chatbot development company building website, WhatsApp, and customer service chatbots that actually resolve issues.",
    description:
      "AI chatbot development covers the design, training, and integration of conversational systems that understand and respond to questions in natural language, trained specifically on your actual business, products, and common customer questions rather than a generic chatbot template. As a full-service AI chatbot agency, we handle scoping, training, conversation design, integration, and ongoing monitoring all under one roof, keeping your chatbot genuinely reliable.",
    image: "/images/ai/3.png",
    features: [
      "Website AI Chatbot",
      "AI Customer Service Chatbot",
      "WhatsApp AI Chatbot",
      "AI Sales Chatbot",
      "GPT Chatbot Development",
      "AI Virtual Assistant Development",
    ],
    benefits: [
      { title: "Trained on your actual business", description: "Custom chatbot development means the chatbot is built around your specific products, services, and customer questions, not shallow generic knowledge." },
      { title: "Knows when to hand off to a human", description: "Chatbots are scoped honestly, understanding exactly which questions they can confidently answer and which situations genuinely need a human." },
      { title: "Tested against real questions", description: "We test extensively against realistic questions and scenarios before launch, refining behavior based on how it actually performs." },
    ],
    technologies: [
      { name: "Botpress", icon: FaRobot, color: "#00B8D9" },
      { name: "OpenAI GPT", icon: SiOpenai, color: "#15AABF" },
      { name: "Meta AI", icon: FaRobot, color: "#0b0b0b" },
      { name: "Dialogflow", icon: SiGooglecloud, color: "#4285F4" },
    ],
    faqs: [
      { question: "How accurate are AI chatbots at answering customer questions?", answer: "Accuracy depends heavily on how well the chatbot is trained and scoped. A properly built chatbot trained on genuinely relevant, accurate business information can handle common questions reliably, while attempting to cover too broad a scope without proper training often reduces overall accuracy and reliability." },
      { question: "Will customers know they are talking to a chatbot?", answer: "This depends on your preference and use case, but transparency generally builds more trust than attempting to disguise a chatbot as a human. Most businesses find that clearly identifying the chatbot while still providing genuinely helpful, natural responses works best for maintaining customer trust." },
      { question: "What happens when the chatbot cannot answer a question?", answer: "Well designed chatbots include clear escalation paths, recognizing when a question falls outside their scope and connecting the customer with a human team member rather than providing an inaccurate or unhelpful response." },
      { question: "Can a chatbot integrate with our existing customer support or sales systems?", answer: "Yes. Chatbot integration services are a core part of what we offer, connecting your chatbot to relevant systems like CRM platforms, support ticketing systems, or ecommerce platforms so it can access genuinely accurate, real time information." },
      { question: "How long does it take to build and launch a custom chatbot?", answer: "Timelines vary based on complexity and scope. A focused FAQ style chatbot might take a few weeks, while a more sophisticated system with multiple integrations typically takes longer. We provide a realistic timeline based on your specific requirements." },
    ],
    keywords: ["AI chatbot development company", "website AI chatbot", "AI customer service chatbot", "WhatsApp AI chatbot", "AI sales chatbot", "GPT chatbot development"],
  },
  {
    slug: "ai-website-integration",
    category: "ai",
    name: "AI Website Integration",
    shortDescription: "An AI website integration company adding chat, search, and recommendation features that make your site genuinely smarter.",
    description:
      "AI website integration services cover the process of adding artificial intelligence capabilities into an existing or new website — chatbots, AI-powered search, recommendation engines, and personalization — connected to your site's actual functionality rather than bolted on as a generic, disconnected widget. As a full-service AI integration agency, we handle discovery, development, testing, and ongoing monitoring all under one roof, keeping your AI features cohesive and genuinely reliable.",
    image: "/images/ai/4.png",
    features: [
      "ChatGPT Integration for Websites",
      "AI Chatbot Website Integration",
      "AI Recommendation Engine Integration",
      "Website Personalization With AI",
      "AI Customer Support Integration",
      "AI API Integration Services",
    ],
    benefits: [
      { title: "Built around your actual website", description: "Custom AI integration is built specifically around your website, your content, and your genuine business goals, not a generic AI widget." },
      { title: "Honest about what's worth adding", description: "We start from a genuine business problem or visitor need, then decide whether AI is actually the right tool, rather than adding features simply because the technology is trending." },
      { title: "Tested against real visitor behavior", description: "Integrations are tested extensively against realistic visitor behavior before launch, then refined based on genuine usage data." },
    ],
    technologies: [
      { name: "OpenAI API", icon: SiOpenai, color: "#15AABF" },
      { name: "Next.js", icon: MdIntegrationInstructions, color: "#333333" },
      { name: "Pinecone Vector DB", icon: FaCogs, color: "#0B84F3" },
      { name: "LangChain", icon: FaRobot, color: "#444444" },
    ],
    faqs: [
      { question: "Will adding AI features slow down my website?", answer: "Properly implemented AI integrations should not meaningfully impact page load times or overall site performance. We test thoroughly to ensure new features integrate smoothly without degrading the existing visitor experience." },
      { question: "Do I need a large amount of data before AI features will work well?", answer: "This depends on the specific feature. Recommendation engines and personalization generally improve with more data over time, while chatbots and AI search can work effectively even with more modest amounts of well organized business information from the start." },
      { question: "Can AI features be added to an existing website, or do I need to rebuild?", answer: "In most cases, AI features can be integrated into an existing website without a full rebuild, though the specific approach depends on your current site's technical structure and the particular feature being added." },
      { question: "How do you ensure AI features actually work well once live?", answer: "We test extensively against realistic scenarios before launch and continue monitoring real usage afterward, refining the integration based on genuine visitor interaction data rather than assumptions made during initial development." },
      { question: "What is the difference between a simple chatbot widget and full AI integration?", answer: "A simple chatbot widget often provides limited, generic responses with little connection to your actual business data, while full AI integration connects intelligent features genuinely to your website's content, systems, and specific business needs for a more accurate, useful experience." },
    ],
    keywords: ["AI website integration company", "ChatGPT integration for websites", "AI chatbot website integration", "AI recommendation engine", "website personalization AI", "AI API integration services"],
  },
  {
    slug: "aeo-ai-enablement",
    category: "ai",
    name: "AEO — AI Enablement",
    shortDescription: "An AEO agency helping your business get cited inside AI-generated answers, plus AI strategy consulting for adopting AI internally.",
    description:
      "Answer engine optimization (AEO) focuses on making sure your content is structured and written in a way AI systems can easily understand, trust, and actually cite when generating answers — different from traditional SEO, which focuses on ranking within a list of links. As a full-service AI optimization services provider, we handle both content-focused AEO work and broader AI strategy and enablement consulting under one roof, giving your business a coherent, genuinely informed approach to AI.",
    image: "/images/ai/5.png",
    features: [
      "AEO Audit and Strategy",
      "AI Content Optimization",
      "Generative Engine Optimization",
      "AI Search Engine Optimization",
      "Answer Engine Marketing",
      "AI Strategy Consulting and Readiness Assessment",
    ],
    benefits: [
      { title: "Built for how AI systems actually evaluate content", description: "Work is grounded in clear structure, genuine expertise signals, and direct, extractable answers — the fundamentals AI systems actually favor when selecting sources." },
      { title: "AEO and internal AI adoption, connected", description: "We treat visibility within AI systems and using AI internally as connected priorities, not separate initiatives handled by disconnected teams." },
      { title: "Honest, not hype", description: "No legitimate provider can guarantee specific citations — we focus on proven principles that genuinely improve your odds of inclusion, not empty promises." },
    ],
    technologies: [
      { name: "AI Audit Tools", icon: FaSearch, color: "#1C7ED6" },
      { name: "Custom AI Strategy", icon: FaCogs, color: "#4b35ff" },
      { name: "Workflow Automation", icon: SiZapier, color: "#FF4A00" },
      { name: "GPT Solutions", icon: SiOpenai, color: "#15AABF" },
    ],
    faqs: [
      { question: "How is answer engine optimization different from traditional SEO?", answer: "Traditional seo focuses on ranking within a list of search results, while AEO focuses on whether AI systems actually cite or reference your business when generating a direct answer to a user's question, which involves somewhat different content and structural considerations." },
      { question: "Can you guarantee my business will be cited by ChatGPT or other AI tools?", answer: "No legitimate provider can honestly guarantee specific citations, since AI systems control their own processes for selecting and synthesizing sources. We focus on proven principles around clarity, structure, and demonstrated expertise that genuinely improve your odds of inclusion." },
      { question: "Do I need both AEO and traditional SEO?", answer: "In most cases, yes. Traditional search still drives significant traffic, and many of the same fundamentals, like clear, well organized, genuinely expert content, support both traditional rankings and AI search visibility simultaneously." },
      { question: "What does an AI readiness assessment actually involve?", answer: "It typically involves reviewing your current data, systems, team capabilities, and specific business goals to identify realistic, high value opportunities for AI adoption, along with any gaps that would need to be addressed before that adoption could actually succeed." },
      { question: "How quickly does this space change, and how do you keep up?", answer: "This is a genuinely fast moving area, with AI systems and best practices continuing to evolve regularly. We stay closely engaged with ongoing developments and continuously adjust strategy and recommendations as the landscape actually changes." },
    ],
    keywords: ["AEO agency", "answer engine optimization", "AI search optimization", "generative engine optimization", "AI strategy consulting", "AI readiness assessment"],
  },
  {
    slug: "ai-video-automation",
    category: "ai",
    name: "AI Video Automation",
    shortDescription: "An AI video automation agency turning one idea into a constant, sustainable stream of platform-ready video content.",
    description:
      "AI video automation services cover the tools, workflows, and AI-powered systems that reduce the manual effort required to produce, edit, and distribute video content — automated editing, AI-generated content, and automated repurposing across platforms, with human oversight kept on creative direction and final review. As a full-service AI video automation agency, we handle workflow design, tool implementation, and ongoing support all under one roof, keeping your production process cohesive and genuinely efficient.",
    image: "/images/ai/6.png",
    features: [
      "Automated Video Production",
      "AI Social Media Video Creation",
      "Automated Short Form Video Creation",
      "AI Video Content Generation",
      "AI Video Workflow Automation",
      "Scalable Video Production Systems",
    ],
    benefits: [
      { title: "Automation where it helps, humans where it matters", description: "AI handles the repetitive, technical work — resizing, initial cuts, captions — while creative direction and brand voice stay in human hands." },
      { title: "Built around how your team actually works", description: "Workflow automation is designed to genuinely reflect how your specific team works, not a rigid, generic automation template." },
      { title: "Reviewed, not fully hands-off", description: "Genuine review checkpoints catch any drift in quality or brand alignment before it becomes a pattern across a growing volume of content." },
    ],
    technologies: [
      { name: "Pika Labs", icon: FaVideo, color: "#F03E3E" },
      { name: "Runway ML", icon: FaVideo, color: "#0b0b0b" },
      { name: "CapCut AI", icon: FaCogs, color: "#0B84F3" },
      { name: "ElevenLabs", icon: FaRobot, color: "#0b0b0b" },
    ],
    faqs: [
      { question: "Will AI generated or automated video content look obviously artificial?", answer: "Not when implemented properly. The strongest results come from combining AI automation for technical, repetitive tasks with genuine human creative oversight, ensuring the finished content still feels authentic and aligned with your brand." },
      { question: "What video tasks should not be automated?", answer: "Core creative direction, storytelling, and brand voice generally still benefit from real human involvement, even as AI increasingly assists with editing, resizing, and other technical production tasks." },
      { question: "How much video output can automation actually help us produce?", answer: "This varies based on your specific setup and content type, but many businesses see meaningful increases in output without a proportional increase in team size once the right automation is properly implemented." },
      { question: "Do you handle both editing automation and AI generated content?", answer: "Yes. We work across the full range of AI video automation, from editing and workflow automation through exploring AI generated video content where it genuinely produces usable, professional results." },
      { question: "How long does it take to set up an AI video automation system?", answer: "A focused automation for a specific task, like short form video repurposing, can often be set up within a few weeks, while more comprehensive workflow automation typically takes longer. We provide a realistic timeline based on your specific needs." },
    ],
    keywords: ["AI video automation agency", "automated video production", "AI social media video creation", "AI video editing automation", "automated short form video", "AI video workflow automation"],
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

/**
 * One representative FAQ from each service in a category (its first,
 * highest-signal question), for the category overview page's FAQ section —
 * every one of these questions is the same verbatim text already used on
 * that service's own detail page, just surfaced a level up so category
 * pages also carry crawlable Q&A content and FAQPage schema.
 */
export function getCategoryFaqs(category: ServiceCategorySlug): ServiceFaq[] {
  return getServicesByCategory(category)
    .map((service) => service.faqs[0])
    .filter((faq): faq is ServiceFaq => Boolean(faq));
}

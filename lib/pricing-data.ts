export type PricingTier = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  ctaText?: string;
  idealFor?: string;
};

export type PricingCategory = "RETAINER" | "WORDPRESS" | "ECOMMERCE" | "CUSTOM";

export type PricingData = {
  GLOBAL: Record<PricingCategory, PricingTier[]>;
  PK: Record<PricingCategory, PricingTier[]>;
};

export const PRICING_DATA: PricingData = {
  GLOBAL: {
    RETAINER: [
      {
        name: "BASIC PACKAGE",
        price: "$499",
        period: "month",
        description: "Best for startups & small businesses",
        features: [
          "Social Media Management (2 platforms, 8 posts/month)",
          "8 Graphic Designs",
          "Basic SEO (5 keywords)",
          "1 Short Video Edit (Reel)",
          "Monthly Performance Report",
          "1 Revision per task",
        ],
        ctaText: "Get Started",
      },
      {
        name: "STANDARD PACKAGE",
        price: "$999",
        period: "month",
        description: "Best for growing businesses",
        isPopular: true,
        features: [
          "Social Media Management (3 platforms, 16 posts/month)",
          "15–20 Graphic Designs",
          "SEO (10–15 keywords + on-page optimization)",
          "4 Video Edits (Reels / Ads)",
          "Basic Branding Kit (logo refresh or brand guidelines)",
          "Monthly Analytics Report",
          "2 Revisions per task",
          "Email Support",
        ],
        ctaText: "Choose Standard",
      },
      {
        name: "PREMIUM PACKAGE",
        price: "$1,799",
        period: "month",
        description: "Best for scaling brands",
        features: [
          "Social Media Management (4 platforms, 25+ posts/month)",
          "Unlimited Graphic Designs (fair usage)",
          "Advanced SEO (20+ keywords, backlinks, technical SEO)",
          "8–12 Video Edits (Ads + Reels)",
          "Full Branding Package (logo, brand identity, guidelines)",
          "Website Development (5–7 pages OR landing page funnel)",
          "Weekly Reporting + Strategy Calls",
          "Priority Support",
          "Unlimited Revisions",
        ],
        ctaText: "Go Premium",
      },
    ],
    WORDPRESS: [
      {
        name: "WORDPRESS STARTER",
        price: "$350",
        period: "one-time",
        description: "5 PAGES - Perfect for businesses, portfolios & blogs.",
        idealFor: "Freelancers, startups, service providers",
        features: [
          "Pages: Home, About, Services, Contact, Blog/Portfolio",
          "Premium theme setup & customization",
          "Mobile responsive & cross-browser compatible",
          "Contact form + Google Maps integration",
          "Basic on-page SEO setup",
          "Social media links integration",
          "Speed & performance optimization",
          "1 month free support after delivery"
        ],
        ctaText: "Start My Website"
      },
      {
        name: "WORDPRESS BUSINESS",
        price: "$550",
        period: "one-time",
        description: "8 PAGES - Custom theme with brand colors.",
        isPopular: true,
        idealFor: "SMEs, agencies, growing businesses",
        features: [
          "Pages: Home, About, Services (x3), Team, Blog, Contact",
          "Custom premium theme with brand colors",
          "Mobile responsive, fast-loading design",
          "Advanced contact forms & lead capture",
          "On-page SEO for all pages",
          "WhatsApp chat button integration",
          "Google Analytics & Pixel setup",
          "2 months free support after delivery"
        ],
        ctaText: "Build My Brand"
      },
      {
        name: "WORDPRESS PROFESSIONAL",
        price: "$750",
        period: "one-time",
        description: "10 PAGES - Fully custom design & advanced UI.",
        idealFor: "Established businesses, agencies",
        features: [
          "Up to 10 fully custom pages (you choose layout)",
          "Custom page builder design (Elementor Pro)",
          "Advanced animations & interactive sections",
          "Multi-service or multi-location setup",
          "Full SEO optimization (meta, schema, sitemap)",
          "Live chat / chatbot integration",
          "Social media feed embed",
          "3 months free support + 1 free revision"
        ],
        ctaText: "Scale Professionally"
      }
    ],
    ECOMMERCE: [
      {
        name: "ECOMMERCE STARTER",
        price: "$450",
        period: "one-time",
        description: "UP TO 5 PRODUCTS - Full online store setup.",
        idealFor: "Side hustles, small product lines",
        features: [
          "WooCommerce store setup on WordPress",
          "Up to 5 product pages with images",
          "Category & product filter setup",
          "Payment gateway integration (Stripe/PayPal)",
          "Cart, checkout & order confirmation pages",
          "Basic shipping & tax configuration",
          "Mobile-optimized product pages",
          "1 month free support"
        ],
        ctaText: "Launch My Store"
      },
      {
        name: "ECOMMERCE BUSINESS",
        price: "$650",
        period: "one-time",
        description: "UP TO 8 PRODUCTS - Advanced store features.",
        isPopular: true,
        idealFor: "Growing online stores, boutiques",
        features: [
          "WooCommerce full store (up to 8 listings)",
          "Custom product pages with variants",
          "Advanced filters, search & comparison",
          "Multiple payment gateways + COD option",
          "Customer account & order tracking",
          "Discount coupons & promo code system",
          "Google Analytics + Facebook Pixel",
          "2 months free support after delivery"
        ],
        ctaText: "Grow My Sales"
      },
      {
        name: "ECOMMERCE ADVANCED",
        price: "$850",
        period: "one-time",
        description: "UP TO 10 PRODUCTS - High-volume store.",
        idealFor: "Established eCommerce brands",
        features: [
          "Full custom WooCommerce (up to 10 products)",
          "Advanced product configurator & bulk pricing",
          "Multi-category store with smart navigation",
          "Inventory management & low-stock alerts",
          "Email automation (abandoned cart)",
          "Product review system + wishlist",
          "SEO-optimized product pages + schema",
          "3 months free support + 1 full revision"
        ],
        ctaText: "Go Enterprise"
      }
    ],
    CUSTOM: [
      {
        name: "CUSTOM CODE STARTER",
        price: "$699",
        period: "one-time",
        description: "5 PAGES - Blazing fast Next.js / React.",
        idealFor: "Startups, SaaS landing pages",
        features: [
          "5 fully custom-designed pages (Next.js)",
          "Pixel-perfect UI based on brand identity",
          "Blazing fast performance (Lighthouse 90+)",
          "Mobile-first responsive design",
          "SEO-ready structure (meta, OG, sitemap)",
          "Contact form with email integration",
          "Deployed on Vercel / Netlify",
          "Clean, documented codebase"
        ],
        ctaText: "Get Custom Site"
      },
      {
        name: "CUSTOM CODE BUSINESS",
        price: "$1,099",
        period: "one-time",
        description: "8 PAGES - Advanced animations & CMS.",
        isPopular: true,
        idealFor: "Agencies, tech startups",
        features: [
          "8 fully custom pages built in Next.js",
          "Advanced animations (Framer Motion / GSAP)",
          "CMS integration (Sanity / Contentful)",
          "API integrations (forms, maps, social)",
          "Authentication (login/signup) if required",
          "Performance optimized image lazy loading",
          "Custom dashboard or admin panel (basic)",
          "2 months free support + deployment"
        ],
        ctaText: "Build Scalable App"
      },
      {
        name: "CUSTOM CODE PRO",
        price: "$1,499",
        period: "one-time",
        description: "10 PAGES - Enterprise-level platform.",
        idealFor: "Large-scale platforms, complex apps",
        features: [
          "Up to 10 custom pages with advanced UI/UX",
          "Full CMS integration with editing panel",
          "Complex API integrations & 3rd-party services",
          "Multi-language support (if needed)",
          "Advanced transitions & micro-interactions",
          "Full SEO architecture + schema + robots",
          "Custom admin dashboard for content",
          "Database integration (Supabase / MongoDB)"
        ],
        ctaText: "Build Enterprise App"
      }
    ]
  },
  PK: {
    RETAINER: [
      {
        name: "BASIC PACKAGE",
        price: "PKR 17,500",
        period: "month",
        description: "Best for small local businesses",
        features: [
          "Social Media Management (1–2 platforms, 8 posts/month)",
          "6–8 Graphic Designs",
          "Basic SEO (3–5 keywords)",
          "1 Video Edit",
          "Monthly Performance Report",
          "1 Revision per task",
        ],
        ctaText: "Get Started",
      },
      {
        name: "STANDARD PACKAGE",
        price: "PKR 35,000",
        period: "month",
        description: "Best for growing businesses",
        isPopular: true,
        features: [
          "Social Media Management (2–3 platforms, 12–16 posts/month)",
          "12–15 Graphic Designs",
          "SEO (8–10 keywords)",
          "3–4 Video Edits",
          "Basic Branding (logo or minor identity work)",
          "Monthly Performance Report",
          "2 Revisions per task",
          "WhatsApp Support",
        ],
        ctaText: "Choose Standard",
      },
      {
        name: "PREMIUM PACKAGE",
        price: "PKR 60,000",
        period: "month",
        description: "Best for serious brands & eCommerce",
        features: [
          "Social Media Management (3–4 platforms, 20+ posts/month)",
          "Unlimited Graphics (fair usage)",
          "Advanced SEO (15–20 keywords + backlinks)",
          "6–8 Video Edits",
          "Full Branding Package (logo + complete brand kit)",
          "Website Development (up to 5 pages)",
          "Weekly Reporting",
          "Priority Support",
          "Unlimited Revisions",
        ],
        ctaText: "Go Premium",
      },
    ],
    WORDPRESS: [
      {
        name: "WORDPRESS STARTER",
        price: "PKR 42,500",
        period: "one-time",
        description: "5 PAGES - Business & Portfolio sites.",
        idealFor: "Freelancers, local startups",
        features: [
          "Pages: Home, About, Services, Contact, Blog/Portfolio",
          "Premium theme setup & customization",
          "Mobile responsive & cross-browser compatible",
          "Contact form + Google Maps integration",
          "Basic on-page SEO setup",
          "Social media links integration",
          "Speed & performance optimization",
          "1 month free support"
        ],
        ctaText: "Start My Website"
      },
      {
        name: "WORDPRESS BUSINESS",
        price: "PKR 67,500",
        period: "one-time",
        description: "8 PAGES - Custom brand colors & lead capture.",
        isPopular: true,
        idealFor: "Growing local businesses, agencies",
        features: [
          "Pages: Home, About, Services (x3), Team, Blog, Contact",
          "Custom premium theme with brand colors",
          "Mobile responsive, fast-loading design",
          "Advanced contact forms & lead capture",
          "On-page SEO for all pages",
          "WhatsApp chat button integration",
          "Google Analytics & Pixel setup",
          "2 months free support"
        ],
        ctaText: "Build My Brand"
      },
      {
        name: "WORDPRESS PROFESSIONAL",
        price: "PKR 92,500",
        period: "one-time",
        description: "10 PAGES - Fully custom local agency site.",
        idealFor: "Established brands, multi-service firms",
        features: [
          "Up to 10 fully custom pages",
          "Custom page builder design (Elementor Pro)",
          "Advanced animations & interactive sections",
          "Multi-service or multi-location setup",
          "Full SEO optimization (meta, schema, sitemap)",
          "Live chat / chatbot integration",
          "Social media feed embed",
          "3 months free support"
        ],
        ctaText: "Scale Professionally"
      }
    ],
    ECOMMERCE: [
      {
        name: "ECOMMERCE STARTER",
        price: "PKR 55,000",
        period: "one-time",
        description: "UP TO 5 PRODUCTS - Local shop online.",
        idealFor: "Local shops, small product lines",
        features: [
          "WooCommerce store setup on WordPress",
          "Up to 5 product pages with images",
          "Category & product filter setup",
          "Payment gateway (JazzCash / EasyPaisa / Stripe)",
          "Cart, checkout & order confirmation pages",
          "Basic shipping & tax configuration",
          "Mobile-optimized product pages",
          "1 month free support"
        ],
        ctaText: "Launch My Store"
      },
      {
        name: "ECOMMERCE BUSINESS",
        price: "PKR 80,000",
        period: "one-time",
        description: "UP TO 8 PRODUCTS - Growing local brands.",
        isPopular: true,
        idealFor: "Local boutiques, product brands",
        features: [
          "WooCommerce full store (up to 8 listings)",
          "Custom product pages with variants",
          "Advanced filters, search & comparison",
          "Multiple payment gateways + COD option",
          "Customer account & order tracking",
          "Discount coupons & promo code system",
          "WhatsApp order button integration",
          "Google Analytics + Facebook Pixel"
        ],
        ctaText: "Grow My Sales"
      },
      {
        name: "ECOMMERCE ADVANCED",
        price: "PKR 105,000",
        period: "one-time",
        description: "UP TO 10 PRODUCTS - Large-scale store.",
        idealFor: "Established local eCommerce brands",
        features: [
          "Full custom WooCommerce (up to 10 products)",
          "Advanced product configurator & bulk pricing",
          "Multi-category store with smart navigation",
          "All major payment gateways + installment options",
          "Inventory management & low-stock alerts",
          "Email automation (order confirmation)",
          "Product review system + wishlist",
          "SEO-optimized product pages + schema"
        ],
        ctaText: "Go Enterprise"
      }
    ],
    CUSTOM: [
      {
        name: "CUSTOM CODE STARTER",
        price: "PKR 87,500",
        period: "one-time",
        description: "5 PAGES - Next.js / React performance.",
        idealFor: "Local tech startups, SaaS",
        features: [
          "5 fully custom-designed pages (Next.js)",
          "Pixel-perfect UI based on brand identity",
          "Blazing fast performance (Lighthouse 90+)",
          "Mobile-first responsive design",
          "SEO-ready structure (meta, OG, sitemap)",
          "Contact form with email integration",
          "Deployed on Vercel / Netlify",
          "1 month free support"
        ],
        ctaText: "Get Custom Site"
      },
      {
        name: "CUSTOM CODE BUSINESS",
        price: "PKR 137,500",
        period: "one-time",
        description: "8 PAGES - Advanced UI & CMS.",
        isPopular: true,
        idealFor: "Local agencies, tech brands",
        features: [
          "8 fully custom pages built in Next.js",
          "Advanced animations (Framer Motion / GSAP)",
          "CMS integration (Sanity / Contentful)",
          "API integrations (forms, maps, social)",
          "Authentication (login/signup) if required",
          "Performance optimized image lazy loading",
          "Custom dashboard or admin panel (basic)",
          "2 months free support"
        ],
        ctaText: "Build Scalable App"
      },
      {
        name: "CUSTOM CODE PRO",
        price: "PKR 187,500",
        period: "one-time",
        description: "10 PAGES - High-performance platform.",
        idealFor: "Established tech firms, complex platforms",
        features: [
          "Up to 10 custom pages with advanced UI/UX",
          "Full CMS integration with editing panel",
          "Complex API integrations & 3rd-party services",
          "Multi-language support (if needed)",
          "Advanced transitions & micro-interactions",
          "Full SEO architecture + schema + robots",
          "Custom admin dashboard for content",
          "Database (Supabase / MongoDB)"
        ],
        ctaText: "Build Enterprise App"
      }
    ]
  }
};

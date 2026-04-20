export type PricingTier = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  ctaText?: string;
};

export type PricingData = {
  GLOBAL: PricingTier[];
  PK: PricingTier[];
};

export const PRICING_DATA: PricingData = {
  GLOBAL: [
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
  PK: [
    {
      name: "BASIC PACKAGE",
      price: "PKR 35,000",
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
      price: "PKR 70,000",
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
      price: "PKR 120,000",
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
};

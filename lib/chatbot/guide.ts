/**
 * Everything the chat widget's guided features say and do: the homepage tour,
 * the "what's on this page?" explanations, the proactive nudges, and the
 * instant-estimate flow.
 *
 * Client-safe on purpose (no server imports) — it ships in the widget's own
 * code-split chunk. Prices are never written here: the estimate reads them
 * from lib/pricing-data.ts, the same source the pricing section and the
 * chatbot's knowledge use, so a price change updates all three.
 */

import { PRICING_DATA, type PricingCategory, type PricingTier } from "@/lib/pricing-data";
import { BUSINESS_FACTS } from "@/lib/chatbot/config";

export type Region = "GLOBAL" | "PK";

/** What a button inside the widget does when tapped. */
export type GuideAction =
  | { kind: "scroll"; selector: string }
  | { kind: "link"; href: string }
  | { kind: "ask"; question: string }
  | { kind: "quote" }
  | { kind: "tour" };

export interface GuideButton {
  label: string;
  action: GuideAction;
}

// ---------------------------------------------------------------------------
// Tour
// ---------------------------------------------------------------------------

export interface TourStep {
  /** First selector that matches a visible element wins, so one step can
   *  point at the desktop nav and fall back to the mobile menu button. */
  selectors: string[];
  title: string;
  body: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    selectors: ["header nav", "header"],
    title: "Everything lives up here",
    body: "Services, past work, our story and the blog. Services opens every category we offer.",
  },
  {
    selectors: ["#about"],
    title: "Who we are",
    body: "A Karachi team working with businesses in Pakistan and worldwide, one partner for design, code, marketing and AI.",
  },
  {
    selectors: ["#services"],
    title: "What we build",
    body: "Websites, online stores, custom software, AI chatbots, branding and marketing. Each service has its own page with what's included.",
  },
  {
    selectors: ["#pricing"],
    title: "Clear starting prices",
    body: "Monthly marketing packages and one-time website builds. Not sure which fits? I can recommend one in three taps.",
  },
  {
    selectors: ["#portfolio"],
    title: "Real projects",
    body: "Work we've shipped for real clients. Tap any project to see the details.",
  },
  {
    selectors: ["#process"],
    title: "How a project runs",
    body: "Every step from your first message and the free meeting to the quote, roadmap and kickoff, so you always know what happens next.",
  },
  {
    selectors: ["#faq"],
    title: "Quick answers",
    body: "The questions clients ask most. Anything missing, just ask me.",
  },
  {
    selectors: ["#contact"],
    title: "Start here",
    body: "Send the team a message, or skip the form and book a free consultation.",
  },
];

// ---------------------------------------------------------------------------
// "What's on this page?"
// ---------------------------------------------------------------------------

export interface PageGuide {
  title: string;
  body: string;
  buttons: GuideButton[];
}

const SERVICE_CATEGORY_NAMES: Record<string, string> = {
  development: "Web & Software Development",
  designing: "Creative Design",
  marketing: "Digital Marketing",
  photography: "Photography & Videography",
  ai: "AI Automation",
};

/**
 * `heading` is the page's own <h1>, read by the widget at open time, so a
 * service or blog page is described by its real name without this file
 * having to import the 90 KB services catalogue.
 */
export function getPageGuide(pathname: string, heading: string): PageGuide {
  const segments = pathname.split("/").filter(Boolean);
  const [first, second, third] = segments;
  const name = heading || "this page";

  if (!first) {
    return {
      title: "You're on the homepage",
      body: "It's the whole of BSH in one scroll: who we are, every service, starting prices, recent work, how we work, and the FAQ.",
      buttons: [
        { label: "Take the tour", action: { kind: "tour" } },
        { label: "Jump to prices", action: { kind: "scroll", selector: "#pricing" } },
        { label: "See our work", action: { kind: "scroll", selector: "#portfolio" } },
      ],
    };
  }

  if (first.toLowerCase() === "services") {
    if (third || (second && !SERVICE_CATEGORY_NAMES[second])) {
      return {
        title: `You're looking at ${name}`,
        body: "This page covers what's included, how it works and the common questions. I can give you a ballpark price for it right now.",
        buttons: [
          { label: "Estimate my price", action: { kind: "quote" } },
          { label: "What's included?", action: { kind: "ask", question: `What's included in ${name}?` } },
          { label: "How long does it take?", action: { kind: "ask", question: `How long does ${name} usually take?` } },
        ],
      };
    }
    if (second) {
      const category = SERVICE_CATEGORY_NAMES[second];
      return {
        title: `${category} services`,
        body: `Every ${category.toLowerCase()} service we offer, each with its own detail page. Tap one to see what's included.`,
        buttons: [
          { label: "Which one do I need?", action: { kind: "ask", question: `I need help with ${category.toLowerCase()}, which service fits me?` } },
          { label: "Estimate my price", action: { kind: "quote" } },
        ],
      };
    }
    return {
      title: "All our services",
      body: "Every category in one place: development, design, marketing, photography and AI. Pick a category to go deeper.",
      buttons: [
        { label: "Help me choose", action: { kind: "ask", question: "I'm not sure which service I need, can you help?" } },
        { label: "Estimate my price", action: { kind: "quote" } },
      ],
    };
  }

  if (first === "portfolio") {
    return second
      ? {
          title: `Case study: ${name}`,
          body: "A real project we delivered: the brief, what we built and the result.",
          buttons: [
            { label: "Build something similar", action: { kind: "quote" } },
            { label: "More projects", action: { kind: "link", href: BUSINESS_FACTS.paths.portfolio } },
          ],
        }
      : {
          title: "Our portfolio",
          body: "Websites, stores, apps and brands we've shipped. Open any project for the full story.",
          buttons: [
            { label: "Plan a project like these", action: { kind: "quote" } },
            { label: "How much would mine cost?", action: { kind: "ask", question: "How much would a project like these cost?" } },
          ],
        };
  }

  if (first === "blog") {
    return second
      ? {
          title: "You're reading an article",
          body: `"${name}". If it sparked an idea for your business, I can turn it into a plan.`,
          buttons: [
            { label: "Can you do this for me?", action: { kind: "ask", question: `I read "${name}". Can you help my business with this?` } },
            { label: "All articles", action: { kind: "link", href: BUSINESS_FACTS.paths.blog } },
          ],
        }
      : {
          title: "The BSH blog",
          body: "Practical guides on websites, marketing and AI for growing businesses.",
          buttons: [{ label: "Ask me instead", action: { kind: "ask", question: "What can BSH Solutions do for my business?" } }],
        };
  }

  if (first === "about") {
    return {
      title: "About BSH Solutions",
      body: "Our story, the team and how we work, based in Karachi and working with clients worldwide.",
      buttons: [
        { label: "Meet on a free call", action: { kind: "link", href: BUSINESS_FACTS.paths.booking } },
        { label: "See our work", action: { kind: "link", href: BUSINESS_FACTS.paths.portfolio } },
      ],
    };
  }

  if (first === "contact") {
    return {
      title: "Contact the team",
      body: `Send the team a message here, or reach them at ${BUSINESS_FACTS.emails.general} or ${BUSINESS_FACTS.phone}.`,
      buttons: [
        { label: "Get an estimate first", action: { kind: "quote" } },
        { label: "Book a free call instead", action: { kind: "link", href: BUSINESS_FACTS.paths.booking } },
      ],
    };
  }

  if (first === "book-consultation") {
    return {
      title: "Book your free consultation",
      body: "Pick a time that suits you (slots are in Pakistan Time). It's free, with no obligation to go ahead.",
      buttons: [
        { label: "What happens on the call?", action: { kind: "ask", question: "What happens on the free consultation call?" } },
      ],
    };
  }

  return {
    title: name === "this page" ? "Here's where you are" : name,
    body: "I can explain anything here, or point you to the right service.",
    buttons: [
      { label: "Show me around", action: { kind: "tour" } },
      { label: "Estimate my price", action: { kind: "quote" } },
    ],
  };
}

// ---------------------------------------------------------------------------
// Proactive nudges
// ---------------------------------------------------------------------------

export interface Nudge {
  /** Each id shows at most once per browser session. */
  id: string;
  text: string;
  /** Wait this long on the page (or, with `whenVisible`, with that element on
   *  screen) before speaking up. */
  delayMs: number;
  whenVisible?: string;
  button: GuideButton;
}

export function getNudges(pathname: string): Nudge[] {
  const segments = pathname.split("/").filter(Boolean);
  const [first, , third] = segments;

  if (!first) {
    return [
      {
        id: "home-pricing",
        text: "Comparing packages? Tell me three things and I'll point you to the right one.",
        delayMs: 6000,
        whenVisible: "#pricing",
        button: { label: "Recommend one", action: { kind: "quote" } },
      },
      {
        id: "home-welcome",
        text: "New here? I can show you around in under a minute.",
        delayMs: 12000,
        button: { label: "Take the tour", action: { kind: "tour" } },
      },
    ];
  }

  if (first.toLowerCase() === "services" && segments.length >= 2) {
    return [
      {
        id: `service-${segments.join("-")}`,
        text: third
          ? "Want a ballpark price for this? It takes three taps."
          : "Not sure which of these you need? Ask me, I'll narrow it down.",
        delayMs: 15000,
        button: third
          ? { label: "Get my estimate", action: { kind: "quote" } }
          : { label: "Help me choose", action: { kind: "ask", question: "Which of these services fits my business?" } },
      },
    ];
  }

  if (first === "portfolio") {
    return [
      {
        id: "portfolio",
        text: "Like what you see? Let's plan yours.",
        delayMs: 12000,
        button: { label: "Plan my project", action: { kind: "quote" } },
      },
    ];
  }

  if (first === "blog" && segments.length >= 2) {
    return [
      {
        id: "blog-article",
        text: "Want us to do this for your business instead?",
        delayMs: 40000,
        button: { label: "Ask Hubi", action: { kind: "ask", question: "Can you help my business with what this article covers?" } },
      },
    ];
  }

  return [];
}

// ---------------------------------------------------------------------------
// Instant estimate
// ---------------------------------------------------------------------------

export type QuoteNeed = "website" | "store" | "custom" | "marketing" | "ai" | "design";
export type QuoteStage = "starting" | "growing" | "scaling";
export type QuoteTimeline = "asap" | "month" | "quarter" | "exploring";

export interface QuoteOption<T extends string> {
  value: T;
  label: string;
  hint: string;
}

export const QUOTE_NEEDS: QuoteOption<QuoteNeed>[] = [
  { value: "website", label: "A business website", hint: "WordPress, fast and easy to edit" },
  { value: "store", label: "An online store", hint: "Sell products and take payments" },
  { value: "custom", label: "A custom web app", hint: "Portals, dashboards, SaaS" },
  { value: "marketing", label: "More customers", hint: "Social, SEO and ads, monthly" },
  { value: "ai", label: "AI chatbot or automation", hint: "Answer, qualify and book 24/7" },
  { value: "design", label: "Branding & design", hint: "Logo, identity, graphics" },
];

export const QUOTE_STAGES: QuoteOption<QuoteStage>[] = [
  { value: "starting", label: "Just starting out", hint: "New business or first website" },
  { value: "growing", label: "Growing", hint: "Customers coming in, ready to level up" },
  { value: "scaling", label: "Established", hint: "Need more features, scale or polish" },
];

export const QUOTE_TIMELINES: QuoteOption<QuoteTimeline>[] = [
  { value: "asap", label: "As soon as possible", hint: "" },
  { value: "month", label: "Within a month", hint: "" },
  { value: "quarter", label: "In 1 to 3 months", hint: "" },
  { value: "exploring", label: "Just exploring", hint: "" },
];

const NEED_TO_CATEGORY: Partial<Record<QuoteNeed, PricingCategory>> = {
  website: "WORDPRESS",
  store: "ECOMMERCE",
  custom: "CUSTOM",
  marketing: "RETAINER",
};

const NEED_SERVICE_PATH: Record<QuoteNeed, string> = {
  website: "/Services/development",
  store: "/Services/development",
  custom: "/Services/development",
  marketing: "/Services/marketing",
  ai: "/Services/ai",
  design: "/Services/designing",
};

const STAGE_TO_TIER: Record<QuoteStage, number> = { starting: 0, growing: 1, scaling: 2 };

export interface QuoteEstimate {
  /** Undefined when the need has no published package (AI, design), which are
   *  always scoped on a call, never given an invented price. */
  tier?: PricingTier;
  /** The package one step down, offered as the budget-friendly alternative. */
  alternative?: PricingTier;
  servicePath: string;
  needLabel: string;
}

export function estimateQuote(need: QuoteNeed, stage: QuoteStage, region: Region): QuoteEstimate {
  const needLabel = QUOTE_NEEDS.find((option) => option.value === need)?.label ?? "Your project";
  const category = NEED_TO_CATEGORY[need];
  const servicePath = NEED_SERVICE_PATH[need];

  if (!category) return { servicePath, needLabel };

  const tiers = PRICING_DATA[region][category];
  const index = Math.min(STAGE_TO_TIER[stage], tiers.length - 1);
  return {
    tier: tiers[index],
    alternative: index > 0 ? tiers[index - 1] : undefined,
    servicePath,
    needLabel,
  };
}

/** Title-cases the pricing table's ALL-CAPS tier names for conversational use. */
export function prettyTierName(name: string): string {
  return name.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatTierPrice(tier: PricingTier): string {
  return tier.period === "month" ? `${tier.price}/month` : `from ${tier.price}`;
}

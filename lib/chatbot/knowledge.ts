/**
 * Builds the chatbot's grounding text out of the site's own content.
 *
 * The assistant is never asked to recall anything about BSH from its training
 * data — every fact it is allowed to state is assembled here from the same
 * modules the public pages render, so an edit to a price or a service
 * description shows up in the chat answers on the next request with no
 * re-indexing, no vector database, and no second copy of the content.
 *
 * Two layers keep the prompt small enough for a free-tier request:
 *   - buildCoreKnowledge() — always sent: contact facts, the service
 *     catalogue as one-liners, the full price list, and the site FAQs.
 *   - buildFocusedKnowledge() — the deep detail (features, benefits, per-
 *     service FAQs) for just the few services the visitor's message is
 *     actually about.
 */

import { PRICING_DATA, type PricingCategory, type PricingTier } from "@/lib/pricing-data";
import { SERVICES, SERVICE_CATEGORIES, type ServiceDefinition } from "@/lib/services-data";
import { SITE_FAQS } from "@/lib/faq-data";
import { BUSINESS_FACTS } from "@/lib/chatbot/config";

export type Region = "GLOBAL" | "PK";

const PRICING_CATEGORY_LABELS: Record<PricingCategory, string> = {
  RETAINER: "Monthly marketing/design retainers",
  WORDPRESS: "WordPress website projects",
  ECOMMERCE: "eCommerce store projects",
  CUSTOM: "Custom-coded website & app projects",
};

function renderTier(tier: PricingTier): string {
  const lines = [
    `  - ${tier.name} — ${tier.price}${tier.period ? ` per ${tier.period}` : ""}${
      tier.isPopular ? " (most popular)" : ""
    }`,
    `    ${tier.description}`,
  ];
  if (tier.idealFor) lines.push(`    Ideal for: ${tier.idealFor}`);
  if (tier.features.length) lines.push(`    Includes: ${tier.features.join("; ")}`);
  return lines.join("\n");
}

function renderPricing(region: Region): string {
  const currency = region === "PK" ? "PKR (Pakistan pricing)" : "USD (international pricing)";
  const blocks = (Object.keys(PRICING_CATEGORY_LABELS) as PricingCategory[]).map((category) => {
    const tiers = PRICING_DATA[region][category];
    if (!tiers?.length) return "";
    return `${PRICING_CATEGORY_LABELS[category]}:\n${tiers.map(renderTier).join("\n")}`;
  });
  return `PRICE LIST — quoted in ${currency}:\n${blocks.filter(Boolean).join("\n\n")}`;
}

function renderCatalogue(): string {
  const byCategory = Object.values(SERVICE_CATEGORIES).map((category) => {
    const services = SERVICES.filter((service) => service.category === category.slug);
    const items = services
      .map((service) => `  - ${service.name}: ${service.shortDescription}`)
      .join("\n");
    return `${category.name} (${category.overviewPath}) — ${category.description}\n${items}`;
  });
  return `SERVICE CATALOGUE (${SERVICES.length} services across ${
    Object.keys(SERVICE_CATEGORIES).length
  } categories):\n${byCategory.join("\n\n")}`;
}

export function buildCoreKnowledge(region: Region): string {
  const facts = BUSINESS_FACTS;
  return [
    `COMPANY: ${facts.longName}. ${facts.tagline}`,
    `Based in ${facts.location}, working with ${facts.worksWith}.`,
    `CONTACT: general enquiries ${facts.emails.general}; project proposals and quotes ${facts.emails.sales}; existing-client technical support ${facts.emails.support}; phone/WhatsApp ${facts.phone}.`,
    `KEY PAGES: free consultation booking ${facts.paths.booking}; contact form ${facts.paths.contact}; pricing ${facts.paths.pricing}; about ${facts.paths.about}; past work ${facts.paths.portfolio}; all services ${facts.paths.services}; blog ${facts.paths.blog}.`,
    `CONSULTATIONS: the first consultation is free. Booked slots are in Pakistan Time (PKT).`,
    "",
    renderCatalogue(),
    "",
    renderPricing(region),
    "",
    `GENERAL FAQS:\n${SITE_FAQS.map((faq) => `  Q: ${faq.question}\n  A: ${faq.answer}`).join("\n")}`,
  ].join("\n");
}

/** Cheap keyword overlap — enough to pick the right few services out of 30
 *  without pulling in an embedding model or a vector store. */
function scoreService(service: ServiceDefinition, terms: string[]): number {
  const haystack = [
    service.name,
    service.slug.replace(/-/g, " "),
    service.shortDescription,
    service.keywords.join(" "),
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;
  for (const term of terms) {
    if (haystack.includes(term)) score += term.length;
  }
  return score;
}

const STOP_WORDS = new Set([
  "the", "and", "for", "you", "your", "our", "with", "what", "how", "much", "does", "can", "are",
  "about", "cost", "price", "want", "need", "have", "that", "this", "from", "has", "its", "would",
  "could", "should", "tell", "give", "they", "them", "will", "any", "all", "get", "like", "please",
]);

export function buildFocusedKnowledge(query: string, limit = 3): string {
  const terms = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 2 && !STOP_WORDS.has(term));

  if (!terms.length) return "";

  const matches = SERVICES.map((service) => ({ service, score: scoreService(service, terms) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (!matches.length) return "";

  const blocks = matches.map(({ service }) => {
    const path = `/Services/${service.category}/${service.slug}`;
    return [
      `${service.name} (${path})`,
      service.description,
      `What's included: ${service.features.join("; ")}`,
      `Why clients choose it: ${service.benefits.map((b) => `${b.title} — ${b.description}`).join(" ")}`,
      service.faqs.length
        ? `Service FAQs:\n${service.faqs.map((f) => `  Q: ${f.question}\n  A: ${f.answer}`).join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  });

  return `RELEVANT SERVICE DETAIL for this question:\n\n${blocks.join("\n\n")}`;
}

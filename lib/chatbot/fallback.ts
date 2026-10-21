/**
 * Keyword fallback used whenever the model can't answer: no GEMINI_API_KEY
 * configured, the free-tier daily quota returned 429, or the upstream call
 * failed. It replies from the same site data rather than showing the visitor
 * an error, so the widget degrades into a simple FAQ bot instead of breaking.
 */

import { PRICING_DATA } from "@/lib/pricing-data";
import { SERVICES, SERVICE_CATEGORIES } from "@/lib/services-data";
import { SITE_FAQS } from "@/lib/faq-data";
import { BUSINESS_FACTS } from "@/lib/chatbot/config";
import type { Region } from "@/lib/chatbot/knowledge";

export interface FallbackAnswer {
  reply: string;
  suggestions: string[];
}

const CONTACT_LINE = `You can reach the team at ${BUSINESS_FACTS.emails.general} or ${BUSINESS_FACTS.phone} (WhatsApp works too), and the first consultation is free: ${BUSINESS_FACTS.paths.booking}`;

function matches(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

export function answerFromKeywords(question: string, region: Region): FallbackAnswer {
  const text = question.toLowerCase();

  // A named service beats a generic intent — someone asking "how much for an
  // ecommerce store" wants the store answer, not the whole price list.
  const service = SERVICES.find((candidate) => {
    const name = candidate.name.toLowerCase();
    const slug = candidate.slug.replace(/-/g, " ");
    return text.includes(name) || text.includes(slug);
  });

  if (service) {
    const path = `/Services/${service.category}/${service.slug}`;
    return {
      reply: `${service.name}, ${service.description}\n\nWhat's included: ${service.features.join(
        ", "
      )}.\n\nFull details: ${path}\n\n${CONTACT_LINE}`,
      suggestions: ["What does this cost?", "Book a free consultation", "See your past work"],
    };
  }

  if (matches(text, [/price|pricing|cost|how much|rate|package|budget|quote|fee/])) {
    const retainers = PRICING_DATA[region].RETAINER.map(
      (tier) => `• ${tier.name}, ${tier.price}/${tier.period}: ${tier.description}`
    ).join("\n");
    return {
      reply: `Here are our monthly retainer packages:\n\n${retainers}\n\nWe also price WordPress, eCommerce, and custom-code projects separately, the full breakdown is at ${BUSINESS_FACTS.paths.pricing}. Every project gets a tailored quote after a quick scoping call.\n\n${CONTACT_LINE}`,
      suggestions: [
        "What's in the Standard package?",
        "How much is an eCommerce store?",
        "Book a free consultation",
      ],
    };
  }

  if (matches(text, [/service|offer|do you (do|build|make)|help with|capabilit/])) {
    const categories = Object.values(SERVICE_CATEGORIES)
      .map((category) => `• ${category.name}, ${category.description}`)
      .join("\n");
    return {
      reply: `We cover ${SERVICES.length} services across ${
        Object.keys(SERVICE_CATEGORIES).length
      } areas:\n\n${categories}\n\nBrowse them all at ${BUSINESS_FACTS.paths.services}.\n\n${CONTACT_LINE}`,
      suggestions: ["Tell me about web development", "What does marketing cost?", "Book a free consultation"],
    };
  }

  if (matches(text, [/book|consult|meeting|call|appointment|schedule|demo/])) {
    return {
      reply: `Happy to set that up, consultations are free. Pick a time at ${BUSINESS_FACTS.paths.booking}, or send your details to ${BUSINESS_FACTS.emails.sales} and the team will come back to you. Slots are shown in Pakistan Time (PKT).`,
      suggestions: ["What should I prepare?", "What does it cost?", "What services do you offer?"],
    };
  }

  if (matches(text, [/contact|email|phone|whatsapp|reach|address|where are you|located|office/])) {
    return {
      reply: `${BUSINESS_FACTS.longName} is based in ${BUSINESS_FACTS.location} and works with ${BUSINESS_FACTS.worksWith}.\n\n• General: ${BUSINESS_FACTS.emails.general}\n• Quotes & proposals: ${BUSINESS_FACTS.emails.sales}\n• Client support: ${BUSINESS_FACTS.emails.support}\n• Phone / WhatsApp: ${BUSINESS_FACTS.phone}\n\nOr use the form at ${BUSINESS_FACTS.paths.contact}.`,
      suggestions: ["Book a free consultation", "What services do you offer?", "What does it cost?"],
    };
  }

  if (matches(text, [/who are you|about|company|bsh|business smart hub|team|experience|why (you|choose)/])) {
    return {
      reply: `${SITE_FAQS[0].answer}\n\n${BUSINESS_FACTS.longName}, ${BUSINESS_FACTS.tagline} We're based in ${BUSINESS_FACTS.location} and work with ${BUSINESS_FACTS.worksWith}. More at ${BUSINESS_FACTS.paths.about}, and you can see past projects at ${BUSINESS_FACTS.paths.portfolio}.`,
      suggestions: ["What services do you offer?", "What does it cost?", "Book a free consultation"],
    };
  }

  const faq = SITE_FAQS.find((candidate) =>
    candidate.question
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 4)
      .some((word) => text.includes(word))
  );

  if (faq) {
    return {
      reply: faq.answer,
      suggestions: ["What services do you offer?", "What does it cost?", "Book a free consultation"],
    };
  }

  return {
    reply: `I can help with our services, pricing, and booking a free consultation. For anything more specific, the team will answer fastest directly, ${BUSINESS_FACTS.emails.general} or ${BUSINESS_FACTS.phone}.\n\n${CONTACT_LINE}`,
    suggestions: ["What services do you offer?", "What does it cost?", "Book a free consultation"],
  };
}

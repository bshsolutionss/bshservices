/**
 * Chatbot wiring and the hard business facts it is allowed to state.
 *
 * Nothing here is invented by the model: the assistant answers only from the
 * knowledge base built in lib/chatbot/knowledge.ts, which is assembled from
 * the same data the public site renders (lib/pricing-data.ts,
 * lib/services-data.ts, lib/faq-data.ts) plus the contact facts below.
 */

import { WHATSAPP_NUMBER } from "@/lib/whatsapp";

/** Gemini's free tier (Google AI Studio key). Flash-Lite is the cheapest,
 *  highest-throughput family — the right fit for a public website widget, and
 *  what Google recommends for new projects (the 2.5 models are now legacy,
 *  reachable only by projects that already used them). Override with
 *  CHATBOT_MODEL to move to a newer or larger model. */
export const CHATBOT_MODEL = process.env.CHATBOT_MODEL || "gemini-3.5-flash-lite";

/** The Interactions API — Gemini's current REST surface, which replaced
 *  :generateContent as the documented path. */
export const GEMINI_INTERACTIONS_URL = "https://generativelanguage.googleapis.com/v1beta/interactions";

/** Lowest reasoning setting the model accepts. A website FAQ answer needs no
 *  deliberation, and spending none keeps latency and free-tier token use down.
 *  Dropped automatically if the configured model rejects the value. */
export const CHATBOT_THINKING_LEVEL = process.env.CHATBOT_THINKING_LEVEL || "minimal";

/** How much of the conversation is sent back to the model. Keeps the free-tier
 *  token spend bounded on a long chat while retaining enough for context. */
export const MAX_HISTORY_TURNS = 12;
export const MAX_MESSAGE_CHARS = 1000;

export const BUSINESS_FACTS = {
  name: "BSH Solutions",
  longName: "Business Smart Hub (BSH Solutions)",
  tagline: "A hub for all business tech needs.",
  location: "Karachi, Pakistan",
  worksWith: "clients locally in Pakistan and internationally",
  emails: {
    general: "info@bshsolutions.net",
    sales: "sales@bshsolutions.net",
    support: "support@bshsolutions.net",
  },
  phone: "+92 312 8994968",
  whatsappUrl: `https://wa.me/${WHATSAPP_NUMBER}`,
  paths: {
    contact: "/contact",
    booking: "/book-consultation",
    pricing: "/#pricing",
    about: "/about",
    portfolio: "/portfolio",
    services: "/Services",
    blog: "/blog",
  },
} as const;

/** Shown as tappable chips when the panel first opens. */
export const STARTER_PROMPTS = [
  "What does BSH Solutions do?",
  "How much does a website cost?",
  "What's in the monthly packages?",
  "I want to book a free consultation",
] as const;

export const GREETING =
  "Hi! I'm BSH Solutions' assistant. Ask me about our services, pricing, or how we work — and I can set up a free consultation for you.";

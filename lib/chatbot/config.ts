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

/**
 * Rate limiting, in three layers, because they defend different things:
 *
 *   BURST / SUSTAINED — per IP, in-memory (lib/rate-limit.ts). Stops one
 *     visitor or script monopolising the bot. Per warm instance only.
 *   DAILY_MODEL_CALL_BUDGET — per day, in Postgres (lib/chatbot/budget.ts).
 *     The one that actually protects the free-tier daily quota, because it is
 *     shared across every serverless instance.
 *   LEADS — per IP per hour, so a conversation can't be used to spam the
 *     leads table (and the team's inbox).
 *
 * The daily default leaves headroom under the free tier's requests-per-day
 * allowance; check your real number at
 * https://aistudio.google.com/rate-limit and set CHATBOT_DAILY_MODEL_CALLS.
 */
export const CHAT_BURST_LIMIT = 6;
export const CHAT_BURST_WINDOW_MS = 60 * 1000;
export const CHAT_SUSTAINED_LIMIT = 40;
export const CHAT_SUSTAINED_WINDOW_MS = 60 * 60 * 1000;
export const CHAT_LEAD_LIMIT = 3;
export const CHAT_LEAD_WINDOW_MS = 60 * 60 * 1000;
export const DAILY_MODEL_CALL_BUDGET = Number(process.env.CHATBOT_DAILY_MODEL_CALLS) || 800;

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

/** The mascot's name, from Business Smart *Hub*. Used by the widget and the
 *  system prompt, so renaming the assistant is a one-line change. */
export const ASSISTANT_NAME = "Hubi";

/** Shown as tappable chips when the panel first opens. */
export const STARTER_PROMPTS = [
  "What does BSH Solutions do?",
  "How much does a website cost?",
  "What's in the monthly packages?",
  "I want to book a free consultation",
] as const;

export const GREETING = `Hi, I'm ${ASSISTANT_NAME}, the guide at ${BUSINESS_FACTS.name}. We build websites, online stores, custom software and AI chatbots, and run marketing for businesses in Pakistan and worldwide.\n\nWhat are you working on?`;

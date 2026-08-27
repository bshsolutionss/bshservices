/**
 * WhatsApp click-to-chat — a `wa.me` deep link pre-fills the first message
 * so a tap opens WhatsApp with real context already typed in, instead of a
 * blank chat. Centralized here so the number only lives in one place.
 */

// Same number already shown as "Call / WhatsApp" in the footer — no
// separate WhatsApp Business number exists yet, so this is intentionally
// the one phone number the whole site uses.
export const WHATSAPP_NUMBER = "923128994968"; // no leading +, no spaces — wa.me's required format

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Default opener used by the floating button / generic CTAs. */
export const DEFAULT_WHATSAPP_MESSAGE =
  "Hi BSH Solutions! I'd like to talk about a project.";

/** Service-page CTAs pass the service name through so the chat opens with real context. */
export function whatsAppMessageForService(serviceName: string): string {
  return `Hi BSH Solutions! I'm interested in your ${serviceName} service — could we talk?`;
}

import { randomUrlId } from "@/lib/random-id";
import type { InboundLead } from "@/lib/lead-intake";

export type LeadSourceType = "website" | "google_ads" | "indiamart" | "webhook";

export interface LeadSourceRow {
  id: string;
  created_at: string;
  type: LeadSourceType;
  name: string;
  token: string;
  stage_key: string | null;
  active: boolean;
  last_lead_at: string | null;
}

export const SOURCE_TYPES: { type: LeadSourceType; title: string; blurb: string; hint: string }[] = [
  {
    type: "website",
    title: "Website contact form",
    blurb: "Every enquiry from the contact form on your own website lands here - add one line of code.",
    hint: "Real-time · paste one line of code",
  },
  {
    type: "google_ads",
    title: "Google Ads lead forms",
    blurb: "Lead form assets on Search, YouTube, Discovery and Performance Max.",
    hint: "Real-time · paste a URL",
  },
  {
    type: "indiamart",
    title: "IndiaMART",
    blurb: "Buy-leads and enquiries pushed to you the moment they arrive.",
    hint: "Real-time push · paste a URL",
  },
  {
    type: "webhook",
    title: "Webhook · Zapier · Make",
    blurb: "LinkedIn, TikTok, Facebook via Zapier/Make, custom tools - anything that can POST.",
    hint: "Real-time · paste a URL",
  },
];

export function newToken(): string {
  return randomUrlId(18);
}

const first = (o: Record<string, unknown>, keys: string[]): string => {
  for (const k of keys) {
    const hit = Object.keys(o).find((x) => x.toLowerCase().replace(/[\s-]/g, "_") === k);
    const v = hit ? o[hit] : undefined;
    if (typeof v === "string" || typeof v === "number") {
      const s = String(v).trim();
      if (s) return s;
    }
  }
  return "";
};

/** Pulls the lead fields out of whatever a platform sent. Anything not recognised is kept under `extra`. */
export function parseInbound(type: LeadSourceType, body: Record<string, unknown>): Pick<InboundLead, "name" | "email" | "phone" | "business" | "location" | "message" | "extra"> {
  const extra: Record<string, string> = {};
  const keep = (k: string, v: unknown, used: Set<string>) => {
    if (used.has(k.toLowerCase())) return;
    if (typeof v === "string" || typeof v === "number") extra[k] = String(v);
  };

  if (type === "google_ads") {
    // Google posts { user_column_data: [{ column_id, string_value }, ...], lead_id, form_id, ... }
    const cols = Array.isArray(body.user_column_data) ? (body.user_column_data as { column_id?: string; string_value?: string }[]) : [];
    const byId = Object.fromEntries(cols.map((c) => [String(c.column_id ?? "").toUpperCase(), String(c.string_value ?? "")]));
    const known = new Set(["FULL_NAME", "FIRST_NAME", "LAST_NAME", "EMAIL", "PHONE_NUMBER", "COMPANY_NAME", "CITY"]);
    for (const [k, v] of Object.entries(byId)) if (!known.has(k) && v) extra[k] = v;
    for (const k of ["campaign_id", "gcl_id", "lead_id"]) if (body[k] != null) extra[k] = String(body[k]);
    return {
      name: byId.FULL_NAME || [byId.FIRST_NAME, byId.LAST_NAME].filter(Boolean).join(" "),
      email: byId.EMAIL,
      phone: byId.PHONE_NUMBER,
      business: byId.COMPANY_NAME,
      location: byId.CITY,
      message: null,
      extra,
    };
  }

  if (type === "indiamart") {
    const used = new Set(["sender_name", "sender_email", "sender_mobile", "sender_company", "sender_city", "query_message", "query_product_name"]);
    for (const [k, v] of Object.entries(body)) keep(k, v, used);
    const product = first(body, ["query_product_name"]);
    const message = first(body, ["query_message"]);
    return {
      name: first(body, ["sender_name"]),
      email: first(body, ["sender_email"]),
      phone: first(body, ["sender_mobile"]),
      business: first(body, ["sender_company"]),
      location: first(body, ["sender_city"]),
      message: [product && `Product: ${product}`, message].filter(Boolean).join("\n") || null,
      extra,
    };
  }

  // website + generic webhook: forgiving field names so a form or Zapier step works without mapping.
  const used = new Set([
    "name", "full_name", "fullname", "your_name", "first_name", "last_name", "email", "email_address", "phone", "mobile", "phone_number", "whatsapp",
    "company", "business", "company_name", "organization", "location", "city", "message", "notes", "details", "comments", "enquiry", "inquiry", "website_url",
  ]);
  for (const [k, v] of Object.entries(body)) keep(k, v, used);
  const name = first(body, ["name", "full_name", "fullname", "your_name"]) || [first(body, ["first_name"]), first(body, ["last_name"])].filter(Boolean).join(" ");
  return {
    name,
    email: first(body, ["email", "email_address"]),
    phone: first(body, ["phone", "mobile", "phone_number", "whatsapp"]),
    business: first(body, ["company", "business", "company_name", "organization"]),
    location: first(body, ["location", "city"]),
    message: first(body, ["message", "notes", "details", "comments", "enquiry", "inquiry"]) || null,
    extra,
  };
}

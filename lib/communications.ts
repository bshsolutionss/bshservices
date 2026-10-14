/** Shared types/constants for client communication. */

export type CommChannel = "call" | "email" | "whatsapp" | "meeting" | "note" | "other";
export type CommDirection = "inbound" | "outbound";

export interface Communication {
  id: string;
  created_at: string;
  client_id: string | null;
  lead_id: string | null;
  project_id: string | null;
  channel: CommChannel;
  direction: CommDirection;
  subject: string | null;
  summary: string | null;
  occurred_at: string;
  follow_up_on: string | null;
  follow_up_done: boolean;
}

export interface MessageTemplate {
  id: string;
  created_at: string;
  name: string;
  subject: string | null;
  body: string;
  sort_order: number;
}

/** What the pickers need to know about a client to pre-fill messages. */
export interface CommClientOption {
  id: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string;
  contact_phone: string | null;
}

export const COMM_CHANNELS: CommChannel[] = ["call", "email", "whatsapp", "meeting", "note", "other"];

export const COMM_CHANNEL_LABELS: Record<CommChannel, string> = {
  call: "Call",
  email: "Email",
  whatsapp: "WhatsApp",
  meeting: "Meeting",
  note: "Note",
  other: "Other",
};

export const COMM_CHANNEL_COLORS: Record<CommChannel, { bg: string; text: string }> = {
  call: { bg: "#DBEAFE", text: "#1E40AF" },
  email: { bg: "#E8E7FB", text: "#1A14A5" },
  whatsapp: { bg: "#D1FAE5", text: "#065F46" },
  meeting: { bg: "#EDE9FE", text: "#5B21B6" },
  note: { bg: "#FEF3C7", text: "#92400E" },
  other: { bg: "#F1F1F1", text: "#4B5563" },
};

export const COMM_DIRECTION_LABELS: Record<CommDirection, string> = {
  inbound: "From client",
  outbound: "To client",
};

/** Replaces {{name}}, {{company}} and {{project}} in a template with real values. */
export function fillTemplate(text: string, values: { name?: string | null; company?: string | null; project?: string | null }): string {
  return text
    .replace(/\{\{\s*name\s*\}\}/gi, values.name || "there")
    .replace(/\{\{\s*company\s*\}\}/gi, values.company || "")
    .replace(/\{\{\s*project\s*\}\}/gi, values.project || "your project");
}

/** wa.me link to a client's own number (digits only, no +). Returns null when there is no usable number. */
export function whatsAppLinkFor(phone: string | null | undefined, message = ""): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length < 8) return null;
  // A local Pakistani number (03xx...) needs the country code for wa.me to open the right chat.
  const international = digits.startsWith("0") ? `92${digits.slice(1)}` : digits;
  return `https://wa.me/${international}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

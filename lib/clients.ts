/** Shared types/constants for clients — mirrors lib/leads.ts's shape. */

/** "monthly" = retainer client billed every month; "one_time" = pays per project. */
export type ClientType = "monthly" | "one_time";

export interface Client {
  id: string;
  created_at: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string;
  contact_phone: string | null;
  industry: string | null;
  account_manager: string | null;
  notes: string | null;
  converted_from_lead_id: string | null;
  client_type: ClientType;
}

export const CLIENT_TYPES: ClientType[] = ["monthly", "one_time"];

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  monthly: "Monthly client",
  one_time: "One-time client",
};

export const CLIENT_TYPE_COLORS: Record<ClientType, { bg: string; text: string }> = {
  monthly: { bg: "#D1FAE5", text: "#065F46" },
  one_time: { bg: "#E8E7FB", text: "#1A14A5" },
};

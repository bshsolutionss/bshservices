/** Shared types/constants for leads — used by API routes, the admin panel, and email templates. */

export type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost";
export type LeadSource = "contact_form" | "service_form";

export interface Lead {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  business: string | null;
  best_time: string | null;
  message: string | null;
  service_category: string | null;
  selected_service: string | null;
  business_type: string | null;
  source: LeadSource;
  page_path: string | null;
  status: LeadStatus;
  status_updated_at: string;
  notes: string | null;
  client_confirmation_sent_at: string | null;
  admin_notified_at: string | null;
  next_follow_up_at: string | null;
  follow_up_stage: number;
  follow_up_completed: boolean;
}

export const LEAD_STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "won", "lost"];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  won: "Won",
  lost: "Lost",
};

/** Tailwind-ish inline color per status, reused by the admin panel's badges. */
export const LEAD_STATUS_COLORS: Record<LeadStatus, { bg: string; text: string }> = {
  new: { bg: "#E8E7FB", text: "#1A14A5" },
  contacted: { bg: "#FEF3C7", text: "#92400E" },
  qualified: { bg: "#DBEAFE", text: "#1E40AF" },
  won: { bg: "#D1FAE5", text: "#065F46" },
  lost: { bg: "#FEE2E2", text: "#991B1B" },
};

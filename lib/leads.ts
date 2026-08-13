/** Shared types/constants for leads — used by API routes, the admin panel, and email templates. */

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "meeting"
  | "proposal_sent"
  | "negotiation"
  | "won"
  | "lost";
export type LeadSource = "contact_form" | "service_form";
export type LeadPriority = "low" | "medium" | "high" | "urgent";
export type LeadLostReason = "budget" | "timing" | "competitor" | "no_response" | "other";

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
  /** Deal fields — merged onto the lead rather than a separate `deals` table. */
  expected_value: number | null;
  priority: LeadPriority;
  lost_reason: LeadLostReason | null;
  /** Set once this lead has a client (either pre-existing, for repeat business, or created on "won"). */
  client_id: string | null;
}

export const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "meeting",
  "proposal_sent",
  "negotiation",
  "won",
  "lost",
];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  meeting: "Meeting",
  proposal_sent: "Proposal Sent",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

/** Tailwind-ish inline color per status, reused by the admin panel's badges/Kanban columns. */
export const LEAD_STATUS_COLORS: Record<LeadStatus, { bg: string; text: string }> = {
  new: { bg: "#E8E7FB", text: "#1A14A5" },
  contacted: { bg: "#FEF3C7", text: "#92400E" },
  qualified: { bg: "#DBEAFE", text: "#1E40AF" },
  meeting: { bg: "#EDE9FE", text: "#5B21B6" },
  proposal_sent: { bg: "#CFFAFE", text: "#155E75" },
  negotiation: { bg: "#FFEDD5", text: "#9A3412" },
  won: { bg: "#D1FAE5", text: "#065F46" },
  lost: { bg: "#FEE2E2", text: "#991B1B" },
};

export const LEAD_PRIORITIES: LeadPriority[] = ["low", "medium", "high", "urgent"];

export const LEAD_PRIORITY_LABELS: Record<LeadPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const LEAD_LOST_REASONS: LeadLostReason[] = ["budget", "timing", "competitor", "no_response", "other"];

export const LEAD_LOST_REASON_LABELS: Record<LeadLostReason, string> = {
  budget: "Budget",
  timing: "Timing",
  competitor: "Went with a competitor",
  no_response: "No response",
  other: "Other",
};

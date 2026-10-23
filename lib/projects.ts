/** Shared types/constants for projects — mirrors lib/leads.ts's shape. */
import type { Currency } from "@/lib/invoices";

/** "monthly" = retainer billed every month; "one_time" = fixed-scope project billed against a budget. */
export type ProjectBillingType = "monthly" | "one_time";

export type ProjectStage = "planning" | "in_progress" | "review" | "completed";

/** Matches the service categories used site-wide (lib/leads.ts, components/services/Form.tsx). */
export type ProjectServiceCategory = string;

export interface Project {
  id: string;
  created_at: string;
  name: string;
  client_id: string;
  lead_id: string | null;
  stage: ProjectStage;
  budget: number | null;
  /** Defaults to PKR (the business's standard currency) — see supabase/migrations/0009_currency.sql. */
  currency: Currency;
  start_date: string | null;
  due_date: string | null;
  service_category: ProjectServiceCategory | null;
  description: string | null;
  archived: boolean;
  billing_type: ProjectBillingType;
  /** Monthly projects only: the retainer charged every month. */
  monthly_fee: number | null;
  /** Day of the month (1-28) the retainer invoice is generated. */
  billing_day: number;
  /** When on, the daily cron drafts each month's retainer invoice automatically. */
  auto_invoice: boolean;
  /** Off = paused retainer: history stays, billing stops. */
  recurring_active: boolean;
  domain_name: string | null;
  domain_expires_on: string | null;
  hosting_provider: string | null;
  hosting_expires_on: string | null;
}

export const PROJECT_STAGES: ProjectStage[] = ["planning", "in_progress", "review", "completed"];

export const PROJECT_STAGE_LABELS: Record<ProjectStage, string> = {
  planning: "Planning",
  in_progress: "In Progress",
  review: "Review",
  completed: "Completed",
};

export const PROJECT_STAGE_COLORS: Record<ProjectStage, { bg: string; text: string }> = {
  planning: { bg: "#E8E7FB", text: "#1A14A5" },
  in_progress: { bg: "#FEF3C7", text: "#92400E" },
  review: { bg: "#DBEAFE", text: "#1E40AF" },
  completed: { bg: "#D1FAE5", text: "#065F46" },
};

export const PROJECT_SERVICE_CATEGORIES: ProjectServiceCategory[] = [
  "Development",
  "Designing",
  "Marketing",
  "Photography",
  "AI Services",
];

export const PROJECT_BILLING_TYPES: ProjectBillingType[] = ["monthly", "one_time"];

export const PROJECT_BILLING_LABELS: Record<ProjectBillingType, string> = {
  monthly: "Monthly",
  one_time: "One-time",
};

export const PROJECT_BILLING_COLORS: Record<ProjectBillingType, { bg: string; text: string }> = {
  monthly: { bg: "#D1FAE5", text: "#065F46" },
  one_time: { bg: "#E8E7FB", text: "#1A14A5" },
};

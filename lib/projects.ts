/** Shared types/constants for projects — mirrors lib/leads.ts's shape. */
import type { Currency } from "@/lib/invoices";

export type ProjectStage = "planning" | "in_progress" | "review" | "completed";

/** Matches the service categories used site-wide (lib/leads.ts, components/services/Form.tsx). */
export type ProjectServiceCategory = "Development" | "Designing" | "Marketing" | "Photography" | "AI Services";

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

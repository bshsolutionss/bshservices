import type { ProjectStage } from "@/lib/projects";
import type { InvoiceStatus } from "@/lib/invoices";

type Tone = "blue" | "green" | "amber" | "red" | "stone" | "orange";

/** Client-facing wording for internal stage names ("in_progress" reads as "Ongoing" to a client). */
export const PORTAL_STAGE: Record<ProjectStage, { label: string; tone: Tone; progress: number }> = {
  planning: { label: "Planning", tone: "stone", progress: 10 },
  in_progress: { label: "Ongoing", tone: "blue", progress: 50 },
  review: { label: "In review", tone: "amber", progress: 85 },
  completed: { label: "Completed", tone: "green", progress: 100 },
};

export const PORTAL_INVOICE: Record<InvoiceStatus | "overdue", { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "stone" },
  sent: { label: "Due", tone: "amber" },
  partially_paid: { label: "Part paid", tone: "orange" },
  paid: { label: "Paid", tone: "green" },
  overdue: { label: "Overdue", tone: "red" },
};

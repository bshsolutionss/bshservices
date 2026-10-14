import type { Currency } from "@/lib/invoices";

export type PersonalProjectStatus = "idea" | "building" | "launched" | "paused" | "abandoned";
export type EntryKind = "cost" | "revenue";

export interface PersonalProject {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  status: PersonalProjectStatus;
  url: string | null;
  currency: Currency;
  start_date: string | null;
  target_date: string | null;
  notes: string | null;
}

export interface PersonalProjectEntry {
  id: string;
  created_at: string;
  project_id: string;
  kind: EntryKind;
  amount: number;
  entry_date: string;
  description: string | null;
}

export const PERSONAL_PROJECT_STATUSES: PersonalProjectStatus[] = ["idea", "building", "launched", "paused", "abandoned"];

export const PERSONAL_PROJECT_STATUS_LABELS: Record<PersonalProjectStatus, string> = {
  idea: "Idea",
  building: "Building",
  launched: "Launched",
  paused: "Paused",
  abandoned: "Abandoned",
};

export const PERSONAL_PROJECT_STATUS_COLORS: Record<PersonalProjectStatus, { bg: string; text: string }> = {
  idea: { bg: "#EDE9FE", text: "#5B21B6" },
  building: { bg: "#FEF3C7", text: "#92400E" },
  launched: { bg: "#D1FAE5", text: "#065F46" },
  paused: { bg: "#F1F1F1", text: "#4B5563" },
  abandoned: { bg: "#FEE2E2", text: "#991B1B" },
};

export function entryTotals(entries: Pick<PersonalProjectEntry, "kind" | "amount">[]) {
  let cost = 0;
  let revenue = 0;
  for (const e of entries) {
    if (e.kind === "cost") cost += Number(e.amount);
    else revenue += Number(e.amount);
  }
  return { cost, revenue, profit: revenue - cost };
}

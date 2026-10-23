/**
 * Editable pipeline stages (Leads > Stages).
 *
 * Stages used to be a fixed list. They are now rows in `lead_stages`, but the
 * rest of the app still reads the shared LEAD_STATUSES / LEAD_STATUS_LABELS /
 * LEAD_STATUS_COLORS from lib/leads.ts, so `applyLeadStages` rewrites those in
 * place (same trick as lib/status-config.ts). The admin layout does it on the
 * server and StatusOverridesInit in the browser, so every screen follows the
 * stages without being touched.
 */
import { LEAD_STATUSES, LEAD_STATUS_COLORS, LEAD_STATUS_LABELS } from "@/lib/leads";
import { optionBadgeColors } from "@/lib/option-lists";

export type LeadStageKind = "open" | "won" | "lost";

export interface LeadStage {
  key: string;
  label: string;
  /** Hex colour of the column dot / badge. */
  color: string;
  position: number;
  kind: LeadStageKind;
}

/** Used until migration 0016 is run (or if the table can't be read). Matches the old fixed pipeline. */
export const DEFAULT_LEAD_STAGES: LeadStage[] = [
  { key: "new", label: "New", color: "#60a5fa", position: 0, kind: "open" },
  { key: "contacted", label: "Contacted", color: "#c084fc", position: 1, kind: "open" },
  { key: "qualified", label: "Qualified", color: "#fbbf24", position: 2, kind: "open" },
  { key: "meeting", label: "Meeting", color: "#8b5cf6", position: 3, kind: "open" },
  { key: "proposal_sent", label: "Proposal Sent", color: "#fb923c", position: 4, kind: "open" },
  { key: "negotiation", label: "Negotiation", color: "#f97316", position: 5, kind: "open" },
  { key: "won", label: "Won", color: "#34d399", position: 6, kind: "won" },
  { key: "lost", label: "Lost", color: "#f87171", position: 7, kind: "lost" },
];

export const STAGE_PALETTE = ["#60a5fa", "#c084fc", "#fbbf24", "#fb923c", "#34d399", "#f87171", "#2dd4bf", "#f472b6"];

/** Replaces the shared lead status lists with these stages. Safe to call repeatedly. */
export function applyLeadStages(stages: LeadStage[]) {
  const sorted = [...stages].sort((a, b) => a.position - b.position);
  LEAD_STATUSES.length = 0;
  for (const key of Object.keys(LEAD_STATUS_LABELS)) delete LEAD_STATUS_LABELS[key];
  for (const key of Object.keys(LEAD_STATUS_COLORS)) delete LEAD_STATUS_COLORS[key];
  for (const s of sorted) {
    LEAD_STATUSES.push(s.key);
    LEAD_STATUS_LABELS[s.key] = s.label;
    LEAD_STATUS_COLORS[s.key] = optionBadgeColors(s.color);
  }
}

/** Keys of every stage of a kind, e.g. the stages that count as "won". */
export function stageKeys(stages: LeadStage[], kind: LeadStageKind): string[] {
  return stages.filter((s) => s.kind === kind).map((s) => s.key);
}

/** A stable machine key for a new custom stage. */
export function newStageKey(label: string, existing: string[]): string {
  const base = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 30) || "stage";
  let key = base;
  let n = 2;
  while (existing.includes(key)) key = `${base}_${n++}`;
  return key;
}

/**
 * Editable names and colours for the fixed status / stage keys.
 *
 * The KEYS (paid, completed, won, lost…) drive real logic - revenue reports,
 * recurring billing, follow-up cron - so they can't be renamed or removed. What
 * you see on screen (the label and badge colour) is yours to change in
 * Settings > Statuses. Overrides are applied in place onto the shared label /
 * colour maps, so every screen that already reads those maps picks them up,
 * with no per-screen changes. Server and client both call `applyStatusOverrides`
 * (layout does it on the server, StatusOverridesInit in the browser).
 */
import { PROJECT_STAGES, PROJECT_STAGE_COLORS, PROJECT_STAGE_LABELS } from "@/lib/projects";
import { TASK_STATUSES, TASK_STATUS_COLORS, TASK_STATUS_LABELS } from "@/lib/tasks";
import { INVOICE_STATUSES, INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS } from "@/lib/invoices";
import { optionBadgeColors } from "@/lib/option-lists";

export type StatusListKey = "project_stage" | "task_status" | "invoice_status";

interface StatusListDef {
  key: StatusListKey;
  label: string;
  description: string;
  keys: readonly string[];
  labels: Record<string, string>;
  colors: Record<string, { bg: string; text: string }>;
}

export const STATUS_LISTS: StatusListDef[] = [
  {
    key: "project_stage",
    label: "Project stages",
    description: "Where a client project is in delivery.",
    keys: PROJECT_STAGES,
    labels: PROJECT_STAGE_LABELS,
    colors: PROJECT_STAGE_COLORS,
  },
  {
    key: "task_status",
    label: "Task statuses",
    description: "Progress of a task.",
    keys: TASK_STATUSES,
    labels: TASK_STATUS_LABELS,
    colors: TASK_STATUS_COLORS,
  },
  {
    key: "invoice_status",
    label: "Invoice statuses",
    description: "Where an invoice is in its life. Overdue is calculated automatically.",
    keys: INVOICE_STATUSES,
    labels: INVOICE_STATUS_LABELS,
    colors: INVOICE_STATUS_COLORS,
  },
];

const PREFIX = "status:";
export const statusListId = (key: StatusListKey) => `${PREFIX}${key}`;
export const isStatusListId = (id: string) => id.startsWith(PREFIX);

/** The built-in names and colours, captured before any override is applied. */
export const STATUS_DEFAULTS: Record<StatusListKey, Record<string, { label: string; color: string }>> = Object.fromEntries(
  STATUS_LISTS.map((list) => [
    list.key,
    Object.fromEntries(list.keys.map((k) => [k, { label: list.labels[k], color: list.colors[k].text }])),
  ])
) as Record<StatusListKey, Record<string, { label: string; color: string }>>;

export interface StatusOverrideRow {
  list_key: string;
  value: string;
  label: string | null;
  color: string | null;
}

/** Restores the defaults, then lays the given overrides on top. Safe to call repeatedly. */
export function applyStatusOverrides(rows: StatusOverrideRow[]) {
  for (const list of STATUS_LISTS) {
    for (const k of list.keys) {
      list.labels[k] = STATUS_DEFAULTS[list.key][k].label;
      // Restore the exact original pair; the default bg isn't derivable from text alone.
      list.colors[k] = DEFAULT_COLOR_PAIRS[list.key][k];
    }
  }
  for (const row of rows) {
    const list = STATUS_LISTS.find((l) => statusListId(l.key) === row.list_key);
    if (!list || !list.keys.includes(row.value)) continue;
    if (row.label?.trim()) list.labels[row.value] = row.label.trim();
    if (row.color) list.colors[row.value] = optionBadgeColors(row.color);
  }
}

const DEFAULT_COLOR_PAIRS: Record<StatusListKey, Record<string, { bg: string; text: string }>> = Object.fromEntries(
  STATUS_LISTS.map((list) => [list.key, Object.fromEntries(list.keys.map((k) => [k, { ...list.colors[k] }]))])
) as Record<StatusListKey, Record<string, { bg: string; text: string }>>;

/** What the Settings screen shows: every key with its current name/colour and whether it differs from the default. */
export function describeStatuses(rows: StatusOverrideRow[]) {
  return STATUS_LISTS.map((list) => ({
    key: list.key,
    label: list.label,
    description: list.description,
    items: list.keys.map((value) => {
      const override = rows.find((r) => r.list_key === statusListId(list.key) && r.value === value);
      const def = STATUS_DEFAULTS[list.key][value];
      return {
        value,
        label: override?.label?.trim() || def.label,
        color: override?.color || def.color,
        defaultLabel: def.label,
        defaultColor: def.color,
        customised: !!(override?.label?.trim() || override?.color),
      };
    }),
  }));
}

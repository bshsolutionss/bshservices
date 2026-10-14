/** Shared types/constants for goals (monthly / yearly targets). */

export type GoalMetric =
  | "revenue"
  | "profit"
  | "expenses"
  | "new_leads"
  | "leads_won"
  | "new_clients"
  | "new_projects"
  | "custom";

export type GoalPeriodType = "monthly" | "yearly";

export interface Goal {
  id: string;
  created_at: string;
  title: string;
  metric: GoalMetric;
  period_type: GoalPeriodType;
  /** "YYYY-MM" for monthly, "YYYY" for yearly. */
  period_key: string;
  target_value: number;
  /** Only used by custom goals - built-in metrics are measured from real data. */
  current_value: number;
  unit: string | null;
  notes: string | null;
}

export interface GoalMetricInfo {
  key: GoalMetric;
  label: string;
  description: string;
  kind: "money" | "count";
  /** Spending-style goals: staying under the target is the win. */
  lowerIsBetter?: boolean;
}

export const GOAL_METRICS: GoalMetricInfo[] = [
  { key: "revenue", label: "Revenue", description: "Payments received (converted to PKR).", kind: "money" },
  { key: "profit", label: "Profit", description: "Payments received minus expenses.", kind: "money" },
  { key: "expenses", label: "Spending limit", description: "Total expenses - stay under the target.", kind: "money", lowerIsBetter: true },
  { key: "new_leads", label: "New leads", description: "Leads that came in during the period.", kind: "count" },
  { key: "leads_won", label: "Deals won", description: "Leads moved to Won during the period.", kind: "count" },
  { key: "new_clients", label: "New clients", description: "Clients added during the period.", kind: "count" },
  { key: "new_projects", label: "New projects", description: "Projects started during the period.", kind: "count" },
  { key: "custom", label: "Custom goal", description: "Anything else - you update the progress yourself.", kind: "count" },
];

export const GOAL_METRIC_BY_KEY = Object.fromEntries(GOAL_METRICS.map((m) => [m.key, m])) as Record<GoalMetric, GoalMetricInfo>;

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function periodLabel(type: GoalPeriodType, key: string): string {
  if (type === "yearly") return key;
  const [year, month] = key.split("-").map(Number);
  return `${MONTH_NAMES[month - 1] ?? key} ${year}`;
}

/** [from, toExclusive) as YYYY-MM-DD strings. */
export function periodRange(type: GoalPeriodType, key: string): { from: string; to: string } {
  if (type === "yearly") {
    const year = Number(key);
    return { from: `${year}-01-01`, to: `${year + 1}-01-01` };
  }
  const [year, month] = key.split("-").map(Number);
  const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };
  return {
    from: `${year}-${String(month).padStart(2, "0")}-01`,
    to: `${next.y}-${String(next.m).padStart(2, "0")}-01`,
  };
}

export function isValidPeriodKey(type: GoalPeriodType, key: string): boolean {
  return type === "yearly" ? /^\d{4}$/.test(key) : /^\d{4}-(0[1-9]|1[0-2])$/.test(key);
}

export function shiftPeriod(type: GoalPeriodType, key: string, delta: number): string {
  if (type === "yearly") return String(Number(key) + delta);
  const [year, month] = key.split("-").map(Number);
  const index = year * 12 + (month - 1) + delta;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`;
}

export type GoalState = "achieved" | "on_track" | "behind" | "over_limit" | "upcoming" | "missed";

export interface GoalProgress extends Goal {
  actual: number;
  /** 0-100+ (can exceed 100). */
  percent: number;
  state: GoalState;
  /** How far through the period we are, 0-1 (1 once it has ended, 0 before it starts). */
  elapsed: number;
}

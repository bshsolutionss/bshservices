import type { Currency } from "@/lib/invoices";

/** Shared types/constants for expenses — mirrors lib/leads.ts's shape. */

/** Editable in Settings > Lists, so any text is valid. */
export type ExpenseCategory = string;

/** "monthly" repeats every month (rent, hosting, salaries); "one_time" is a single payment. */
export type ExpenseType = "monthly" | "one_time";

export interface Expense {
  id: string;
  created_at: string;
  category: ExpenseCategory;
  amount: number;
  currency: Currency;
  expense_date: string;
  vendor: string | null;
  description: string | null;
  expense_type: ExpenseType;
  /** Only meaningful on a monthly template row: off = stop generating future months. */
  recurring_active: boolean;
  /** Set on rows generated from a monthly template. */
  recurring_parent_id: string | null;
  /** Optional project this cost belongs to. */
  project_id: string | null;
}

export const EXPENSE_TYPES: ExpenseType[] = ["one_time", "monthly"];

export const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  one_time: "One-time",
  monthly: "Monthly",
};

export const EXPENSE_TYPE_COLORS: Record<ExpenseType, { bg: string; text: string }> = {
  one_time: { bg: "#E8E7FB", text: "#1A14A5" },
  monthly: { bg: "#FEF3C7", text: "#92400E" },
};

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Office",
  "Software",
  "Salaries",
  "Advertising",
  "Hosting",
  "Domain",
  "Other",
];

export const EXPENSE_CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Office: { bg: "#E8E7FB", text: "#1A14A5" },
  Software: { bg: "#DBEAFE", text: "#1E40AF" },
  Salaries: { bg: "#D1FAE5", text: "#065F46" },
  Advertising: { bg: "#FFEDD5", text: "#9A3412" },
  Hosting: { bg: "#CFFAFE", text: "#155E75" },
  Domain: { bg: "#EDE9FE", text: "#5B21B6" },
  Other: { bg: "#F1F1F1", text: "#4B5563" },
};

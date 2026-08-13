import type { Currency } from "@/lib/invoices";

/** Shared types/constants for expenses — mirrors lib/leads.ts's shape. */

export type ExpenseCategory =
  | "Office"
  | "Software"
  | "Salaries"
  | "Advertising"
  | "Hosting"
  | "Domain"
  | "Other";

export interface Expense {
  id: string;
  created_at: string;
  category: ExpenseCategory;
  amount: number;
  currency: Currency;
  expense_date: string;
  vendor: string | null;
  description: string | null;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Office",
  "Software",
  "Salaries",
  "Advertising",
  "Hosting",
  "Domain",
  "Other",
];

export const EXPENSE_CATEGORY_COLORS: Record<ExpenseCategory, { bg: string; text: string }> = {
  Office: { bg: "#E8E7FB", text: "#1A14A5" },
  Software: { bg: "#DBEAFE", text: "#1E40AF" },
  Salaries: { bg: "#D1FAE5", text: "#065F46" },
  Advertising: { bg: "#FFEDD5", text: "#9A3412" },
  Hosting: { bg: "#CFFAFE", text: "#155E75" },
  Domain: { bg: "#EDE9FE", text: "#5B21B6" },
  Other: { bg: "#F1F1F1", text: "#4B5563" },
};

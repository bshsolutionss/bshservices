/** Shared types/constants for the team (employees and freelancers) — mirrors lib/leads.ts's shape. */
import type { Currency } from "@/lib/invoices";

/** "job" = salaried staff, "freelance" = paid per project/hour, no fixed salary. */
export type EmploymentType = "job" | "freelance";
export type PayBasis = "monthly" | "hourly" | "per_project";

export type EmployeeStatus = "active" | "inactive";

export interface Employee {
  id: string;
  created_at: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  department: string | null;
  status: EmployeeStatus;
  hire_date: string | null;
  notes: string | null;
  employment_type: EmploymentType;
  pay_basis: PayBasis;
  pay_amount: number | null;
  pay_currency: Currency;
}

export const EMPLOYEE_STATUSES: EmployeeStatus[] = ["active", "inactive"];

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: "Active",
  inactive: "Inactive",
};

export const EMPLOYEE_STATUS_COLORS: Record<EmployeeStatus, { bg: string; text: string }> = {
  active: { bg: "#D1FAE5", text: "#065F46" },
  inactive: { bg: "#F1F1F1", text: "#6B7280" },
};

export const EMPLOYMENT_TYPES: EmploymentType[] = ["job", "freelance"];

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  job: "Job (staff)",
  freelance: "Freelance",
};

export const EMPLOYMENT_TYPE_COLORS: Record<EmploymentType, { bg: string; text: string }> = {
  job: { bg: "#E8E7FB", text: "#1A14A5" },
  freelance: { bg: "#FFEDD5", text: "#9A3412" },
};

export const PAY_BASES: PayBasis[] = ["monthly", "hourly", "per_project"];

export const PAY_BASIS_LABELS: Record<PayBasis, string> = {
  monthly: "Monthly salary",
  hourly: "Per hour",
  per_project: "Per project",
};

/** Short suffix for a rate, e.g. "/ mo", "/ hr". */
export const PAY_BASIS_SUFFIX: Record<PayBasis, string> = {
  monthly: "/ mo",
  hourly: "/ hr",
  per_project: "/ project",
};

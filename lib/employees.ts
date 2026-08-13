/** Shared types/constants for employees — mirrors lib/leads.ts's shape. */

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

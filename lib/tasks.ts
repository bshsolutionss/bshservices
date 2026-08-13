/** Shared types/constants for tasks — mirrors lib/leads.ts's shape. */

export type TaskStatus = "todo" | "in_progress" | "review" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  created_at: string;
  project_id: string;
  title: string;
  description: string | null;
  assignee_name: string | null;
  priority: TaskPriority;
  due_date: string | null;
  status: TaskStatus;
  estimated_hours: number | null;
}

export const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "review", "completed"];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  completed: "Completed",
};

export const TASK_STATUS_COLORS: Record<TaskStatus, { bg: string; text: string }> = {
  todo: { bg: "#E8E7FB", text: "#1A14A5" },
  in_progress: { bg: "#FEF3C7", text: "#92400E" },
  review: { bg: "#DBEAFE", text: "#1E40AF" },
  completed: { bg: "#D1FAE5", text: "#065F46" },
};

export const TASK_PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

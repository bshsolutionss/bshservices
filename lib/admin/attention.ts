import { createServiceRoleClient } from "@/lib/supabase/service";
import { todayInPkt } from "@/lib/availability";
import type { TaskPriority, TaskStatus } from "@/lib/tasks";
import type { Currency, InvoiceStatus } from "@/lib/invoices";

export interface AttentionTask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  assignee_name: string | null;
  assignee_id: string | null;
  project_id: string;
  projectName: string;
  /** Whole days past the due date (0 = due today, negative = still ahead). */
  daysLate: number;
}

export interface AttentionInvoice {
  invoice_id: string;
  invoice_number: string;
  clientName: string;
  due_date: string | null;
  balance: number;
  currency: Currency;
  status: InvoiceStatus;
  daysLate: number;
}

export interface AttentionFollowUp {
  id: string;
  client_id: string | null;
  clientName: string;
  subject: string | null;
  follow_up_on: string;
  daysLate: number;
}

export interface AttentionProject {
  id: string;
  name: string;
  clientName: string;
  due_date: string;
  stage: string;
  daysLate: number;
}

export interface Attention {
  today: string;
  awaitingApproval: AttentionTask[];
  overdueTasks: AttentionTask[];
  dueSoonTasks: AttentionTask[];
  overdueInvoices: AttentionInvoice[];
  followUps: AttentionFollowUp[];
  deadlineProjects: AttentionProject[];
}

const one = <T,>(value: T | T[] | null | undefined): T | null => (Array.isArray(value) ? (value[0] ?? null) : (value ?? null));

function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / 86_400_000);
}

interface Options {
  /** "mine" limits tasks to one team member (the employee view). Money and client data are never loaded for it. */
  scope: "all" | "mine";
  employeeId?: string | null;
  includeMoney: boolean;
  includeClientData: boolean;
}

/**
 * Everything that needs a person's attention now, each with how late it is, so
 * pages can show "what's urgent" before any history. Every query is optional and
 * fault-tolerant - one missing table must never blank the whole dashboard.
 */
export async function getAttention(options: Options): Promise<Attention> {
  const supabase = createServiceRoleClient();
  const today = todayInPkt();
  const weekAhead = new Date(`${today}T00:00:00Z`);
  weekAhead.setUTCDate(weekAhead.getUTCDate() + 7);
  const weekAheadIso = weekAhead.toISOString().slice(0, 10);
  const monthAhead = new Date(`${today}T00:00:00Z`);
  monthAhead.setUTCDate(monthAhead.getUTCDate() + 14);
  const monthAheadIso = monthAhead.toISOString().slice(0, 10);

  const mine = options.scope === "mine";
  const taskSelect = "id, title, status, priority, due_date, assignee_name, assignee_id, project_id, projects(name)";

  const tasksQuery = () => {
    let query = supabase.from("tasks").select(taskSelect).neq("status", "completed").limit(300);
    if (mine) query = query.eq("assignee_id", options.employeeId ?? "00000000-0000-0000-0000-000000000000");
    return query;
  };

  const [tasksRes, invoicesRes, commsRes, projectsRes] = await Promise.all([
    tasksQuery(),
    options.includeMoney
      ? supabase
          .from("invoice_balances")
          .select("invoice_id, invoice_number, due_date, balance, currency, status, client_id")
          .eq("is_overdue", true)
          .order("due_date")
          .limit(50)
      : Promise.resolve({ data: [] }),
    options.includeClientData
      ? supabase
          .from("communications")
          .select("id, client_id, subject, follow_up_on, clients(company_name)")
          .eq("follow_up_done", false)
          .not("follow_up_on", "is", null)
          .lte("follow_up_on", weekAheadIso)
          .order("follow_up_on")
          .limit(50)
      : Promise.resolve({ data: [] }),
    options.includeClientData
      ? supabase
          .from("projects")
          .select("id, name, due_date, stage, clients(company_name)")
          .eq("archived", false)
          .neq("stage", "completed")
          .not("due_date", "is", null)
          .lte("due_date", monthAheadIso)
          .order("due_date")
          .limit(50)
      : Promise.resolve({ data: [] }),
  ]);

  type TaskRow = Omit<AttentionTask, "projectName" | "daysLate"> & { projects: { name: string } | { name: string }[] | null };
  const tasks: AttentionTask[] = ((tasksRes.data ?? []) as unknown as TaskRow[]).map((t) => {
    const { projects, ...rest } = t;
    return {
      ...rest,
      projectName: one(projects)?.name ?? "—",
      daysLate: t.due_date ? daysBetween(t.due_date, today) : -9999,
    };
  });

  const byDue = (a: AttentionTask, b: AttentionTask) => (a.due_date ?? "9999") < (b.due_date ?? "9999") ? -1 : 1;

  // Client names for invoices come from a second small lookup (the view has client_id only).
  let clientNames = new Map<string, string>();
  const invoiceRows = (invoicesRes.data ?? []) as {
    invoice_id: string;
    invoice_number: string;
    due_date: string | null;
    balance: number;
    currency: Currency;
    status: InvoiceStatus;
    client_id: string;
  }[];
  if (invoiceRows.length > 0) {
    const { data } = await supabase
      .from("clients")
      .select("id, company_name")
      .in("id", [...new Set(invoiceRows.map((i) => i.client_id))]);
    clientNames = new Map(((data ?? []) as { id: string; company_name: string }[]).map((c) => [c.id, c.company_name]));
  }

  return {
    today,
    awaitingApproval: tasks.filter((t) => t.status === "review").sort(byDue),
    overdueTasks: tasks.filter((t) => t.status !== "review" && t.due_date && t.daysLate > 0).sort(byDue),
    dueSoonTasks: tasks
      .filter((t) => t.status !== "review" && t.due_date && t.due_date >= today && t.due_date <= weekAheadIso)
      .sort(byDue),
    overdueInvoices: invoiceRows.map((i) => ({
      invoice_id: i.invoice_id,
      invoice_number: i.invoice_number,
      clientName: clientNames.get(i.client_id) ?? "—",
      due_date: i.due_date,
      balance: Number(i.balance),
      currency: i.currency,
      status: i.status,
      daysLate: i.due_date ? daysBetween(i.due_date, today) : 0,
    })),
    followUps: ((commsRes.data ?? []) as unknown as {
      id: string;
      client_id: string | null;
      subject: string | null;
      follow_up_on: string;
      clients: { company_name: string } | { company_name: string }[] | null;
    }[]).map((c) => ({
      id: c.id,
      client_id: c.client_id,
      clientName: one(c.clients)?.company_name ?? "—",
      subject: c.subject,
      follow_up_on: c.follow_up_on,
      daysLate: daysBetween(c.follow_up_on, today),
    })),
    deadlineProjects: ((projectsRes.data ?? []) as unknown as {
      id: string;
      name: string;
      due_date: string;
      stage: string;
      clients: { company_name: string } | { company_name: string }[] | null;
    }[]).map((p) => ({
      id: p.id,
      name: p.name,
      clientName: one(p.clients)?.company_name ?? "—",
      due_date: p.due_date,
      stage: p.stage,
      daysLate: daysBetween(p.due_date, today),
    })),
  };
}

export { dueText } from "@/lib/due-text";

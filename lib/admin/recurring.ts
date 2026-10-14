/**
 * Recurring work: monthly retainer invoices and monthly expenses.
 *
 * Both are idempotent by construction - a unique index on
 * (project_id, billing_period) for invoices and (recurring_parent_id,
 * expense_date) for expenses - so the daily cron, a manual "Sync now" and a
 * retry can all run safely without ever double-billing or double-counting.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { logActivity } from "@/lib/activity";
import { getInvoiceSettings } from "@/lib/admin/invoice-settings";
import { todayInPkt } from "@/lib/availability";
import type { Project } from "@/lib/projects";
import type { Expense } from "@/lib/expenses";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function periodLabel(period: string): string {
  const [year, month] = period.split("-").map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}

function addDaysIso(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export type RetainerResult =
  | { status: "created"; id: string; invoiceNumber: string }
  | { status: "exists"; id: string }
  | { status: "error"; error: string };

/**
 * Drafts the retainer invoice for one project and month (period = "YYYY-MM").
 * Always lands as a draft so it can be reviewed and emailed before the client sees it.
 */
export async function createRetainerInvoice(
  service: SupabaseClient,
  project: Pick<Project, "id" | "name" | "client_id" | "currency" | "monthly_fee">,
  period: string,
  issueDate = todayInPkt()
): Promise<RetainerResult> {
  const fee = Number(project.monthly_fee ?? 0);
  if (!fee || fee <= 0) return { status: "error", error: "This project has no monthly fee set." };

  const { data: existing } = await service
    .from("invoices")
    .select("id")
    .eq("project_id", project.id)
    .eq("billing_period", period)
    .maybeSingle<{ id: string }>();
  if (existing) return { status: "exists", id: existing.id };

  const settings = await getInvoiceSettings();

  const { data: numberData, error: numberError } = await service.rpc("next_invoice_number");
  if (numberError || !numberData) {
    console.error("[recurring] invoice number failed:", numberError);
    return { status: "error", error: "Could not generate an invoice number." };
  }

  const { data: invoice, error } = await service
    .from("invoices")
    .insert({
      invoice_number: numberData,
      client_id: project.client_id,
      project_id: project.id,
      amount: fee,
      tax_rate: settings.default_tax_rate,
      currency: project.currency,
      issue_date: issueDate,
      due_date: addDaysIso(issueDate, settings.default_due_days),
      billing_period: period,
      status: "draft",
    })
    .select("id, invoice_number")
    .single<{ id: string; invoice_number: string }>();

  if (error || !invoice) {
    // Lost a race with another run - the unique index did its job.
    if (error?.code === "23505") {
      const { data: raced } = await service
        .from("invoices")
        .select("id")
        .eq("project_id", project.id)
        .eq("billing_period", period)
        .maybeSingle<{ id: string }>();
      if (raced) return { status: "exists", id: raced.id };
    }
    console.error("[recurring] invoice insert failed:", error);
    return { status: "error", error: "Could not create the invoice." };
  }

  const { error: itemError } = await service.from("invoice_items").insert({
    invoice_id: invoice.id,
    position: 0,
    description: `Monthly retainer - ${project.name} (${periodLabel(period)})`,
    quantity: 1,
    unit_price: fee,
  });
  if (itemError) {
    console.error("[recurring] invoice item failed, rolling back:", itemError);
    await service.from("invoices").delete().eq("id", invoice.id);
    return { status: "error", error: "Could not create the invoice line." };
  }

  await logActivity({
    entityType: "invoice",
    entityId: invoice.id,
    type: "recurring_invoice",
    description: `Retainer invoice ${invoice.invoice_number} drafted for ${periodLabel(period)}`,
  });
  await logActivity({
    entityType: "project",
    entityId: project.id,
    type: "recurring_invoice",
    description: `Retainer invoice ${invoice.invoice_number} drafted for ${periodLabel(period)}`,
  });

  return { status: "created", id: invoice.id, invoiceNumber: invoice.invoice_number };
}

export interface RecurringRunSummary {
  invoicesCreated: number;
  expensesCreated: number;
  errors: string[];
}

/** Drafts every due retainer invoice and books every due monthly expense. */
export async function runRecurringJobs(today = todayInPkt()): Promise<RecurringRunSummary> {
  const service = createServiceRoleClient();
  const summary: RecurringRunSummary = { invoicesCreated: 0, expensesCreated: 0, errors: [] };

  const [year, month, day] = today.split("-").map(Number);
  const period = `${year}-${String(month).padStart(2, "0")}`;

  /* ── retainer invoices ── */
  const { data: projectsData, error: projectsError } = await service
    .from("projects")
    .select("*")
    .eq("billing_type", "monthly")
    .eq("recurring_active", true)
    .eq("auto_invoice", true)
    .eq("archived", false);
  if (projectsError) summary.errors.push(`projects: ${projectsError.message}`);

  for (const project of (projectsData ?? []) as Project[]) {
    if (project.stage === "completed") continue;
    if (day < project.billing_day) continue; // not due yet this month

    // Never bill retroactively for a month that ended before the project existed.
    const billingDate = `${period}-${String(project.billing_day).padStart(2, "0")}`;
    const startedOn = project.start_date ?? project.created_at.slice(0, 10);
    if (billingDate < startedOn) continue;

    const result = await createRetainerInvoice(service, project, period, today);
    if (result.status === "created") summary.invoicesCreated++;
    else if (result.status === "error") summary.errors.push(`${project.name}: ${result.error}`);
  }

  /* ── monthly expenses ── */
  const { data: templatesData, error: templatesError } = await service
    .from("expenses")
    .select("*")
    .eq("expense_type", "monthly")
    .eq("recurring_active", true)
    .is("recurring_parent_id", null);
  if (templatesError) summary.errors.push(`expenses: ${templatesError.message}`);

  for (const template of (templatesData ?? []) as Expense[]) {
    const [ty, tm, td] = template.expense_date.split("-").map(Number);
    // Walk every month from the one after the template up to today, so a missed cron run catches up.
    let y = ty;
    let m = tm;
    for (let guard = 0; guard < 36; guard++) {
      m += 1;
      if (m > 12) {
        m = 1;
        y += 1;
      }
      const dueDay = Math.min(td, lastDayOfMonth(y, m));
      const dueDate = `${y}-${String(m).padStart(2, "0")}-${String(dueDay).padStart(2, "0")}`;
      if (dueDate > today) break;

      const { error } = await service.from("expenses").insert({
        category: template.category,
        amount: template.amount,
        currency: template.currency,
        expense_date: dueDate,
        vendor: template.vendor,
        description: template.description,
        project_id: template.project_id,
        expense_type: "monthly",
        recurring_parent_id: template.id,
        recurring_active: false,
      });
      if (!error) summary.expensesCreated++;
      else if (error.code !== "23505") summary.errors.push(`${template.vendor ?? template.category}: ${error.message}`);
    }
  }

  return summary;
}

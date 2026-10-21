import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckSquare, Receipt } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { Client } from "@/lib/clients";
import {
  PROJECT_BILLING_COLORS,
  PROJECT_BILLING_LABELS,
  PROJECT_STAGES,
  PROJECT_STAGE_COLORS,
  PROJECT_STAGE_LABELS,
  type Project,
  type ProjectServiceCategory,
  type ProjectStage,
} from "@/lib/projects";
import type { AssigneeOption, Task } from "@/lib/tasks";
import {
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  formatDate,
  formatMoney,
  type Invoice,
  type InvoiceBalance,
  type InvoiceStatus,
} from "@/lib/invoices";
import { Badge, EmptyState, PageHeader, SectionCard } from "@/components/admin/ui";
import ProjectEditControl from "@/components/admin/ProjectEditControl";
import NewTaskInlineForm from "@/components/admin/NewTaskInlineForm";
import TaskRow from "@/components/admin/TaskRow";
import ActivityTimeline from "@/components/admin/ActivityTimeline";
import InvoiceCreateButton from "@/components/admin/invoices/InvoiceCreateButton";
import ProjectStageFlow from "@/components/admin/projects/ProjectStageFlow";
import RetainerInvoiceButton from "@/components/admin/projects/RetainerInvoiceButton";
import { periodLabel } from "@/lib/admin/recurring";
import { todayInPkt } from "@/lib/availability";

export const dynamic = "force-dynamic";

export default async function AdminProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  /** `?invoice=new` is the handoff from the create-project flow — it opens the invoice builder on arrival. */
  searchParams: Promise<{ invoice?: string }>;
}) {
  const { id } = await params;
  const { invoice: invoiceParam } = await searchParams;
  const supabase = createServiceRoleClient();

  // One round trip: the project (with its client embedded) and everything keyed on its id,
  // instead of project -> client/tasks/invoices -> balances in sequence.
  const [{ data: projectRow }, { data: tasksData }, { data: invoicesData }, { data: employeesData }, { data: balanceRows }] =
    await Promise.all([
      supabase.from("projects").select("*, clients(*)").eq("id", id).single(),
      supabase.from("tasks").select("*").eq("project_id", id).order("created_at", { ascending: false }),
      supabase.from("invoices").select("*").eq("project_id", id).order("created_at", { ascending: false }),
      supabase.from("employees").select("id, name, email").eq("status", "active").order("name"),
      supabase.from("invoice_balances").select("*").eq("project_id", id),
    ]);

  if (!projectRow) {
    notFound();
  }
  const { clients: clientJoin, ...projectFields } = projectRow as Project & { clients: Client | Client[] | null };
  const project = projectFields as Project;
  const client = (Array.isArray(clientJoin) ? clientJoin[0] : clientJoin) ?? null;

  const tasks = (tasksData ?? []) as Task[];
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const invoiceRows = (invoicesData ?? []) as Invoice[];
  const assignees = (employeesData ?? []) as AssigneeOption[];

  // paid/balance/overdue come from the invoice_balances view - the single
  // source of truth for that math - joined back onto the invoices above.
  const balanceById = new Map(
    ((balanceRows ?? []) as InvoiceBalance[]).map((b) => [b.invoice_id, b])
  );
  const invoices = invoiceRows.map((inv) => {
    const balance = balanceById.get(inv.id);
    return {
      invoice_id: inv.id,
      invoice_number: inv.invoice_number,
      status: inv.status,
      currency: inv.currency,
      due_date: inv.due_date,
      total: Number(inv.total),
      paid: Number(balance?.paid ?? 0),
      balance: Number(balance?.balance ?? inv.total),
      is_overdue: balance?.is_overdue ?? false,
    };
  });

  // Everything on this page is in the project's own currency — a project and
  // its invoices are billed in one currency, so no conversion is needed.
  const invoiced = invoices
    .filter((i) => i.status !== "draft")
    .reduce((sum, i) => sum + Number(i.total), 0);
  const paid = invoices.reduce((sum, i) => sum + Number(i.paid), 0);
  const outstanding = invoices
    .filter((i) => i.status === "sent" || i.status === "partially_paid")
    .reduce((sum, i) => sum + Number(i.balance), 0);
  const isMonthly = project.billing_type === "monthly";
  const monthlyFee = project.monthly_fee != null ? Number(project.monthly_fee) : null;
  const currentPeriod = todayInPkt().slice(0, 7);
  const billedThisMonth = invoiceRows.some((i) => i.billing_period === currentPeriod);
  const budget = project.budget != null ? Number(project.budget) : null;
  const unbilled = !isMonthly && budget !== null ? Math.max(budget - invoiced, 0) : null;

  const invoiceButton = client ? (
    <InvoiceCreateButton
      clients={[{ id: client.id, company_name: client.company_name }]}
      projects={[
        {
          id: project.id,
          name: project.name,
          client_id: project.client_id,
          budget: isMonthly ? monthlyFee : unbilled && unbilled > 0 ? unbilled : project.budget,
          currency: project.currency,
        },
      ]}
      defaultClientId={client.id}
      defaultProjectId={project.id}
      lockSelection
      label="Create invoice"
      autoOpen={invoiceParam === "new"}
    />
  ) : null;

  const retainerButton =
    isMonthly && project.recurring_active && !billedThisMonth ? (
      <RetainerInvoiceButton projectId={project.id} periodLabel={periodLabel(currentPeriod)} />
    ) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/admin/projects"
        backLabel="Projects"
        title={
          <span className="flex flex-wrap items-center gap-3">
            {project.name}
            <Badge
              label={PROJECT_STAGE_LABELS[project.stage as ProjectStage]}
              colors={PROJECT_STAGE_COLORS[project.stage as ProjectStage]}
            />
            <Badge
              label={PROJECT_BILLING_LABELS[project.billing_type] ?? "One-time"}
              colors={PROJECT_BILLING_COLORS[project.billing_type] ?? PROJECT_BILLING_COLORS.one_time}
            />
            {isMonthly && !project.recurring_active && <Badge label="Billing paused" colors={{ bg: "#FEF3C7", text: "#92400E" }} />}
            {project.archived && <Badge label="Archived" colors={{ bg: "#F1F1F1", text: "#6B7280" }} />}
          </span>
        }
        subtitle={
          <>
            {client && (
              <Link href={`/admin/clients/${client.id}`} className="font-medium text-[#1A14A5] hover:underline">
                {client.company_name}
              </Link>
            )}
            {project.service_category && <> · {project.service_category}</>}
            {isMonthly && monthlyFee !== null && <> · {formatMoney(monthlyFee, project.currency)} / month</>}
            {!isMonthly && budget !== null && <> · Budget {formatMoney(budget, project.currency)}</>}
            {project.due_date && <> · Due {formatDate(project.due_date)}</>}
          </>
        }
        actions={
          <>
            {retainerButton}
            {invoiceButton}
          </>
        }
      />

      <ProjectStageFlow
        stage={project.stage as ProjectStage}
        stages={PROJECT_STAGES}
        startDate={project.start_date}
        dueDate={project.due_date}
        taskCount={tasks.length}
        completedTasks={completedCount}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {project.description && (
            <SectionCard title="Scope">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#231F20]/75">{project.description}</p>
            </SectionCard>
          )}

          <SectionCard
            title="Tasks"
            subtitle={`${completedCount} of ${tasks.length} completed`}
            bodyClassName="px-5 pb-5 pt-4 sm:px-6"
          >
            <NewTaskInlineForm projectId={project.id} assignees={assignees} />
            {tasks.length === 0 ? (
              <EmptyState
                icon={CheckSquare}
                title="No tasks yet"
                description="Break the work down so progress is visible to everyone."
              />
            ) : (
              <ul className="divide-y divide-[#1A14A5]/5">
                {tasks.map((task) => (
                  <TaskRow key={task.id} task={task} assignees={assignees} />
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard
            title="Invoices"
            subtitle={
              invoices.length > 0
                ? `${formatMoney(invoiced, project.currency)} invoiced · ${formatMoney(paid, project.currency)} paid`
                : "Nothing billed yet"
            }
            action={invoiceButton}
          >
            {invoices.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No invoices for this project"
                description="Create one from the budget — it starts as a draft you can review before sending."
              />
            ) : (
              <ul className="divide-y divide-[#1A14A5]/5">
                {invoices.map((inv) => (
                  <li key={inv.invoice_id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/invoices/${inv.invoice_id}`}
                        className="font-medium text-[#1A14A5] hover:underline"
                      >
                        {inv.invoice_number}
                      </Link>
                      <p className="text-xs text-[#231F20]/50">
                        {inv.due_date ? `Due ${formatDate(inv.due_date)}` : "No due date"}
                        {inv.is_overdue && <span className="font-semibold text-red-600"> · overdue</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[#231F20]">
                        {formatMoney(inv.total, inv.currency)}
                      </span>
                      <Badge
                        label={INVOICE_STATUS_LABELS[inv.status as InvoiceStatus]}
                        colors={INVOICE_STATUS_COLORS[inv.status as InvoiceStatus]}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <ActivityTimeline entityType="project" entityId={project.id} />
        </div>

        <div className="space-y-6">
          <SectionCard title="Billing" subtitle={`In ${project.currency}`}>
            <dl className="space-y-2.5 text-sm">
              {isMonthly ? (
                <>
                  <Row label="Monthly fee" value={monthlyFee !== null ? formatMoney(monthlyFee, project.currency) : "Not set"} />
                  <Row
                    label="Billing day"
                    value={`Day ${project.billing_day}`}
                    hint={project.auto_invoice ? "Draft created automatically" : "Created manually"}
                  />
                </>
              ) : (
                <Row label="Budget" value={budget !== null ? formatMoney(budget, project.currency) : "Not set"} />
              )}
              <Row label="Invoiced" value={formatMoney(invoiced, project.currency)} />
              <Row label="Paid" value={formatMoney(paid, project.currency)} tone="positive" />
              <Row label="Outstanding" value={formatMoney(outstanding, project.currency)} tone="warning" />
              {unbilled !== null && (
                <Row
                  label="Left to bill"
                  value={formatMoney(unbilled, project.currency)}
                  hint={unbilled === 0 ? "Budget fully invoiced" : undefined}
                />
              )}
            </dl>
          </SectionCard>

          <ProjectEditControl
            projectId={project.id}
            projectName={project.name}
            initialStage={project.stage as ProjectStage}
            initialBudget={project.budget}
            initialCurrency={project.currency}
            initialStartDate={project.start_date}
            initialDueDate={project.due_date}
            initialServiceCategory={project.service_category as ProjectServiceCategory | null}
            initialDescription={project.description}
            initialArchived={project.archived}
            initialBillingType={project.billing_type ?? "one_time"}
            initialMonthlyFee={project.monthly_fee}
            initialBillingDay={project.billing_day ?? 1}
            initialAutoInvoice={!!project.auto_invoice}
            initialRecurringActive={project.recurring_active ?? true}
            taskCount={tasks.length}
          />
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone?: "positive" | "warning";
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-[#231F20]/55">{label}</dt>
      <dd className="text-right">
        <span
          className={
            tone === "positive"
              ? "font-semibold text-emerald-700"
              : tone === "warning"
                ? "font-semibold text-amber-700"
                : "font-semibold text-[#231F20]"
          }
        >
          {value}
        </span>
        {hint && <span className="block text-xs text-[#231F20]/40">{hint}</span>}
      </dd>
    </div>
  );
}

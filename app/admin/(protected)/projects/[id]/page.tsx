import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { Client } from "@/lib/clients";
import type { Project, ProjectStage, ProjectServiceCategory } from "@/lib/projects";
import type { Task } from "@/lib/tasks";
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS, formatMoney, type Invoice, type InvoiceStatus } from "@/lib/invoices";
import ProjectEditControl from "@/components/admin/ProjectEditControl";
import NewTaskInlineForm from "@/components/admin/NewTaskInlineForm";
import TaskRow from "@/components/admin/TaskRow";
import NewInvoiceInlineForm from "@/components/admin/NewInvoiceInlineForm";
import ActivityTimeline from "@/components/admin/ActivityTimeline";

export const dynamic = "force-dynamic";

export default async function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceRoleClient();

  const { data: project } = await supabase.from("projects").select("*").eq("id", id).single<Project>();
  if (!project) {
    notFound();
  }

  const [{ data: client }, { data: tasksData }, { data: invoicesData }, { data: employeesData }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", project.client_id).single<Client>(),
    supabase.from("tasks").select("*").eq("project_id", id).order("created_at", { ascending: false }),
    supabase.from("invoices").select("*").eq("project_id", id).order("created_at", { ascending: false }),
    supabase.from("employees").select("name").eq("status", "active").order("name"),
  ]);

  const tasks = (tasksData ?? []) as Task[];
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const invoices = (invoicesData ?? []) as Invoice[];
  const employeeNames = ((employeesData ?? []) as { name: string }[]).map((e) => e.name);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/projects" className="text-sm text-[#1A14A5] hover:underline">
          ← Back to Projects
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-2xl font-extrabold text-[#231F20]">{project.name}</h1>
          {project.archived && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">Archived</span>
          )}
        </div>
        {client && (
          <Link href={`/admin/clients/${client.id}`} className="text-sm text-[#1A14A5] hover:underline">
            {client.company_name}
          </Link>
        )}
        {project.service_category && (
          <span className="ml-2 text-xs font-bold px-2.5 py-1 rounded-full bg-[#1A14A5]/10 text-[#1A14A5]">
            {project.service_category}
          </span>
        )}
        {project.description && (
          <p className="text-sm text-[#231F20]/70 mt-3 max-w-2xl whitespace-pre-wrap">{project.description}</p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#231F20]">Tasks</h2>
              <span className="text-xs text-[#231F20]/50">
                {completedCount}/{tasks.length} completed
              </span>
            </div>

            <NewTaskInlineForm projectId={project.id} employeeNames={employeeNames} />

            {tasks.length === 0 ? (
              <p className="text-sm text-[#231F20]/50">No tasks yet.</p>
            ) : (
              <ul className="divide-y divide-[#1A14A5]/5">
                {tasks.map((task) => (
                  <TaskRow key={task.id} task={task} employeeNames={employeeNames} />
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#231F20]">Invoices</h2>
              {client && (
                <NewInvoiceInlineForm
                  clients={[{ id: client.id, company_name: client.company_name }]}
                  projects={[{ id: project.id, name: project.name, client_id: project.client_id }]}
                  defaultClientId={client.id}
                  defaultProjectId={project.id}
                  defaultAmount={project.budget ?? undefined}
                  defaultCurrency={project.currency}
                  lockSelection
                  triggerLabel="+ Create Invoice"
                />
              )}
            </div>
            {invoices.length === 0 ? (
              <p className="text-sm text-[#231F20]/50">No invoices yet.</p>
            ) : (
              <ul className="divide-y divide-[#1A14A5]/5">
                {invoices.map((invoice) => (
                  <li key={invoice.id} className="py-3 flex items-center justify-between">
                    <Link href={`/admin/invoices/${invoice.id}`} className="font-medium text-[#1A14A5] hover:underline">
                      {invoice.invoice_number}
                    </Link>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[#231F20]/70">{formatMoney(invoice.total, invoice.currency)}</span>
                      <span
                        className="text-xs font-bold px-3 py-1 rounded-full"
                        style={{
                          background: INVOICE_STATUS_COLORS[invoice.status as InvoiceStatus].bg,
                          color: INVOICE_STATUS_COLORS[invoice.status as InvoiceStatus].text,
                        }}
                      >
                        {INVOICE_STATUS_LABELS[invoice.status as InvoiceStatus]}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <ActivityTimeline entityType="project" entityId={project.id} />
        </div>

        <ProjectEditControl
          projectId={project.id}
          initialStage={project.stage as ProjectStage}
          initialBudget={project.budget}
          initialCurrency={project.currency}
          initialStartDate={project.start_date}
          initialDueDate={project.due_date}
          initialServiceCategory={project.service_category as ProjectServiceCategory | null}
          initialDescription={project.description}
          initialArchived={project.archived}
          taskCount={tasks.length}
        />
      </div>
    </div>
  );
}

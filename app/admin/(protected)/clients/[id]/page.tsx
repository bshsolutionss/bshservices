import Link from "next/link";
import { notFound } from "next/navigation";
import { FolderKanban, Receipt } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { Client } from "@/lib/clients";
import { PROJECT_STAGE_COLORS, PROJECT_STAGE_LABELS, type Project, type ProjectStage } from "@/lib/projects";
import {
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  formatDate,
  formatMoney,
  type Invoice,
  type InvoiceStatus,
} from "@/lib/invoices";
import { Badge, EmptyState, PageHeader, SectionCard } from "@/components/admin/ui";
import ClientEditControl from "@/components/admin/ClientEditControl";
import DeleteClientButton from "@/components/admin/DeleteClientButton";
import ActivityTimeline from "@/components/admin/ActivityTimeline";
import ProjectCreateButton from "@/components/admin/projects/ProjectCreateButton";
import InvoiceCreateButton from "@/components/admin/invoices/InvoiceCreateButton";

export const dynamic = "force-dynamic";

export default async function AdminClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceRoleClient();

  const [{ data: client }, { data: projectsData }, { data: invoicesData }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).single<Client>(),
    supabase.from("projects").select("*").eq("client_id", id).order("created_at", { ascending: false }),
    supabase.from("invoices").select("*").eq("client_id", id).order("created_at", { ascending: false }),
  ]);

  if (!client) {
    notFound();
  }

  const projects = (projectsData ?? []) as Project[];
  const invoices = (invoicesData ?? []) as Invoice[];

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/admin/clients"
        backLabel="Clients"
        title={client.company_name}
        subtitle={
          <>
            {client.contact_email}
            {client.contact_name && <> · {client.contact_name}</>}
            {client.industry && <> · {client.industry}</>}
          </>
        }
        actions={
          <>
            <ProjectCreateButton
              clientId={client.id}
              clientName={client.company_name}
              variant="outline"
              label="New project"
            />
            <InvoiceCreateButton
              clients={[{ id: client.id, company_name: client.company_name }]}
              projects={projects.map((p) => ({
                id: p.id,
                name: p.name,
                client_id: p.client_id,
                budget: p.budget,
                currency: p.currency,
              }))}
              defaultClientId={client.id}
              label="New invoice"
            />
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="Projects" subtitle={`${projects.length} total`}>
            {projects.length === 0 ? (
              <EmptyState
                icon={FolderKanban}
                title="No projects yet"
                description="Create the first project to start tracking work and billing for this client."
              />
            ) : (
              <ul className="divide-y divide-[#1A14A5]/5">
                {projects.map((project) => (
                  <li key={project.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="font-medium text-[#1A14A5] hover:underline"
                      >
                        {project.name}
                      </Link>
                      <p className="text-xs text-[#231F20]/50">
                        {project.budget != null ? formatMoney(Number(project.budget), project.currency) : "No budget"}
                        {project.due_date && ` · due ${formatDate(project.due_date)}`}
                      </p>
                    </div>
                    <Badge
                      label={PROJECT_STAGE_LABELS[project.stage as ProjectStage]}
                      colors={PROJECT_STAGE_COLORS[project.stage as ProjectStage]}
                    />
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Invoices" subtitle={`${invoices.length} total`}>
            {invoices.length === 0 ? (
              <EmptyState icon={Receipt} title="No invoices yet" description="Bill a project to create the first one." />
            ) : (
              <ul className="divide-y divide-[#1A14A5]/5">
                {invoices.map((invoice) => (
                  <li key={invoice.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/invoices/${invoice.id}`}
                        className="font-medium text-[#1A14A5] hover:underline"
                      >
                        {invoice.invoice_number}
                      </Link>
                      <p className="text-xs text-[#231F20]/50">
                        {invoice.due_date ? `Due ${formatDate(invoice.due_date)}` : "No due date"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[#231F20]">
                        {formatMoney(invoice.total, invoice.currency)}
                      </span>
                      <Badge
                        label={INVOICE_STATUS_LABELS[invoice.status as InvoiceStatus]}
                        colors={INVOICE_STATUS_COLORS[invoice.status as InvoiceStatus]}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <ActivityTimeline entityType="client" entityId={client.id} />
        </div>

        <div className="space-y-6">
          <ClientEditControl
            clientId={client.id}
            initial={{
              company_name: client.company_name,
              contact_name: client.contact_name,
              contact_email: client.contact_email,
              contact_phone: client.contact_phone,
              industry: client.industry,
              account_manager: client.account_manager,
              notes: client.notes,
            }}
          />
          <DeleteClientButton clientId={client.id} />
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { Client } from "@/lib/clients";
import { PROJECT_STAGE_LABELS, PROJECT_STAGE_COLORS, type Project, type ProjectStage } from "@/lib/projects";
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS, formatMoney, type Invoice, type InvoiceStatus } from "@/lib/invoices";
import ClientEditControl from "@/components/admin/ClientEditControl";
import NewProjectInlineForm from "@/components/admin/NewProjectInlineForm";
import ActivityTimeline from "@/components/admin/ActivityTimeline";

export const dynamic = "force-dynamic";

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceRoleClient();

  const [{ data: client }, { data: projects }, { data: invoices }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).single<Client>(),
    supabase.from("projects").select("*").eq("client_id", id).order("created_at", { ascending: false }),
    supabase.from("invoices").select("*").eq("client_id", id).order("created_at", { ascending: false }),
  ]);

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/clients" className="text-sm text-[#1A14A5] hover:underline">
          ← Back to Clients
        </Link>
        <h1 className="text-2xl font-extrabold text-[#231F20] mt-2">{client.company_name}</h1>
        <p className="text-[#231F20]/60 text-sm">{client.contact_email}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#231F20]">Projects</h2>
              <NewProjectInlineForm clientId={client.id} />
            </div>
            {(projects as Project[] | null)?.length ? (
              <ul className="divide-y divide-[#1A14A5]/5">
                {(projects as Project[]).map((project) => (
                  <li key={project.id} className="py-3 flex items-center justify-between">
                    <Link href={`/admin/projects/${project.id}`} className="font-medium text-[#1A14A5] hover:underline">
                      {project.name}
                    </Link>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{
                        background: PROJECT_STAGE_COLORS[project.stage as ProjectStage].bg,
                        color: PROJECT_STAGE_COLORS[project.stage as ProjectStage].text,
                      }}
                    >
                      {PROJECT_STAGE_LABELS[project.stage as ProjectStage]}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#231F20]/50">No projects yet.</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 p-6">
            <h2 className="font-bold text-[#231F20] mb-4">Invoices</h2>
            {(invoices as Invoice[] | null)?.length ? (
              <ul className="divide-y divide-[#1A14A5]/5">
                {(invoices as Invoice[]).map((invoice) => (
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
            ) : (
              <p className="text-sm text-[#231F20]/50">No invoices yet.</p>
            )}
          </div>

          <ActivityTimeline entityType="client" entityId={client.id} />
        </div>

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
      </div>
    </div>
  );
}

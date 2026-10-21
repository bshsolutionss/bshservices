import { createServiceRoleClient } from "@/lib/supabase/service";
import type { Client } from "@/lib/clients";
import { PageHeader } from "@/components/admin/ui";
import ClientFormModal from "@/components/admin/clients/ClientFormModal";
import ClientsTable from "@/components/admin/clients/ClientsTable";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const supabase = createServiceRoleClient();
  const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false }).limit(200);

  const clients = (data ?? []) as Client[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        subtitle={`Companies you work with - their projects, invoices and conversations in one place. ${clients.length} client${clients.length === 1 ? "" : "s"} (added automatically when a lead is marked Won).`}
        actions={<ClientFormModal />}
      />

      <ClientsTable clients={clients} emptyTitle="No clients yet" emptyAction={<ClientFormModal />} />
    </div>
  );
}

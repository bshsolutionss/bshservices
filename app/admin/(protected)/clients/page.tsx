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
        subtitle={`${clients.length} client${clients.length === 1 ? "" : "s"} · created automatically when a lead is marked Won`}
        actions={<ClientFormModal />}
      />

      <ClientsTable clients={clients} />
    </div>
  );
}

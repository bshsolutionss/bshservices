import { createServiceRoleClient } from "@/lib/supabase/service";
import type { Client } from "@/lib/clients";
import NewClientInlineForm from "@/components/admin/NewClientInlineForm";
import ClientsTable from "@/components/admin/clients/ClientsTable";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const clients = (data ?? []) as Client[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#231F20]">Clients</h1>
        <p className="text-[#231F20]/60 text-sm mt-1">
          {clients.length} client{clients.length === 1 ? "" : "s"}
        </p>
      </div>

      <ClientsTable clients={clients} toolbarExtra={<NewClientInlineForm />} />
    </div>
  );
}

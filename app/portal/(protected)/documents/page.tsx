import { FolderOpen } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getPortalSession } from "@/lib/portal/session";
import { PageHeader } from "@/components/portal/ui";
import { DocumentRows, type DocRow } from "@/components/portal/lists";

export default async function PortalDocumentsPage() {
  const session = (await getPortalSession())!;
  const { data } = await createServiceRoleClient()
    .from("documents")
    .select("id, title, category, file_name, size_bytes, created_at")
    .eq("client_id", session.clientId)
    .eq("shared", true)
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader icon={FolderOpen} title="Documents" subtitle="Quotations, contracts and files shared with you." />
      <DocumentRows rows={(data ?? []) as DocRow[]} empty={{ title: "No documents yet", description: "Contracts, quotations and shared files will land here." }} />
    </div>
  );
}

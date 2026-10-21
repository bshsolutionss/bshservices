import { createServiceRoleClient } from "@/lib/supabase/service";
import type { CommClientOption, Communication, MessageTemplate } from "@/lib/communications";

type Joined = Communication & {
  clients: { company_name: string; contact_phone: string | null } | { company_name: string; contact_phone: string | null }[] | null;
  projects: { name: string } | { name: string }[] | null;
};

const one = <T,>(value: T | T[] | null): T | null => (Array.isArray(value) ? (value[0] ?? null) : value);

/** Everything the communication screens need, fetched in one parallel round trip. */
export async function loadCommunicationData(options: { clientId?: string; limit?: number } = {}) {
  const supabase = createServiceRoleClient();
  let query = supabase
    .from("communications")
    .select("*, clients(company_name, contact_phone), projects(name)")
    .order("occurred_at", { ascending: false })
    .limit(options.limit ?? 300);
  if (options.clientId) query = query.eq("client_id", options.clientId);

  const [{ data }, { data: clientsData }, { data: projectsData }, { data: templatesData }] = await Promise.all([
    query,
    supabase
      .from("clients")
      .select("id, company_name, contact_name, contact_email, contact_phone")
      .order("company_name"),
    supabase.from("projects").select("id, name, client_id").eq("archived", false).order("name"),
    supabase.from("message_templates").select("*").order("sort_order"),
  ]);

  const rows = ((data ?? []) as unknown as Joined[]).map((row) => {
    const { clients, projects, ...rest } = row;
    const client = one(clients);
    return {
      ...(rest as Communication),
      clientName: client?.company_name ?? "-",
      clientPhone: client?.contact_phone ?? null,
      projectName: one(projects)?.name ?? null,
    };
  });

  return {
    rows,
    clients: (clientsData ?? []) as CommClientOption[],
    projects: (projectsData ?? []) as { id: string; name: string; client_id: string }[],
    templates: (templatesData ?? []) as MessageTemplate[],
  };
}

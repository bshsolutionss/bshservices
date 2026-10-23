import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getTeamSession } from "@/lib/team/session";
import { getTeamProjects } from "@/lib/team/data";
import { formatMoney } from "@/lib/invoices";
import { EmptyState, PageHeader, portalCard } from "@/components/portal/ui";

export default async function TeamClientsPage() {
  const session = (await getTeamSession())!;
  if (session.access.clients === "none") redirect("/team");
  const projects = await getTeamProjects(session);
  const clientIds = [...new Set(projects.map((p) => p.client_id))];
  const { data: clients } = clientIds.length ? await createServiceRoleClient().from("clients").select("id, company_name, contact_name, contact_email, contact_phone").in("id", clientIds).order("company_name") : { data: [] };
  const showMoney = session.access.financials === "visible";

  return (
    <div>
      <PageHeader icon={Users} title="Clients" subtitle="Clients of the projects you can see." />
      {(clients ?? []).length === 0 ? (
        <EmptyState icon={Users} title="No clients yet" description="Clients appear here once you can see one of their projects." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {(clients ?? []).map((c) => {
            const theirs = projects.filter((p) => p.client_id === c.id);
            const total = theirs.reduce((s, p) => s + Number(p.budget ?? 0), 0);
            return (
              <div key={c.id} className={`${portalCard} p-5`}>
                <p className="font-semibold">{c.company_name}</p>
                <p className="text-sm text-stone-500">{[c.contact_name, c.contact_phone].filter(Boolean).join(" · ") || c.contact_email}</p>
                <p className="mt-3 text-xs text-stone-400">
                  {theirs.length} project{theirs.length === 1 ? "" : "s"}
                  {showMoney && total > 0 && ` · ${formatMoney(total, theirs[0].currency)}`}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

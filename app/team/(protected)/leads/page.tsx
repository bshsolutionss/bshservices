import { redirect } from "next/navigation";
import { BellRing, Phone, Target } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getTeamSession } from "@/lib/team/session";
import { ensureLeadStages } from "@/lib/admin/lead-stages";
import { formatMoney, type Currency } from "@/lib/invoices";
import { EmptyState, PageHeader, portalCard } from "@/components/portal/ui";
import { LeadStageSelect } from "@/components/team/TeamForms";

export default async function TeamLeadsPage() {
  const session = (await getTeamSession())!;
  if (session.access.leads === "none") redirect("/team");
  const stages = await ensureLeadStages();
  const canEdit = session.access.leads === "edit";
  const showValues = session.access.financials === "visible";

  const { data } = await createServiceRoleClient()
    .from("leads")
    .select("id, name, business, phone, status, expected_value, expected_value_currency, assigned_to, reminder_at")
    .neq("source", "consultation_booking")
    .order("created_at", { ascending: false })
    .limit(300);
  const leads = data ?? [];

  return (
    <div>
      <PageHeader icon={Target} title="Leads" subtitle={canEdit ? "The shared pipeline - move leads along as you speak to them." : "The shared pipeline (view only)."} />
      {leads.length === 0 ? (
        <EmptyState icon={Target} title="No leads yet" description="New leads will appear here." />
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const items = leads.filter((l) => l.status === stage.key);
            return (
              <div key={stage.key} className="w-64 shrink-0 rounded-3xl border p-3" style={{ background: `${stage.color}14`, borderColor: `${stage.color}40` }}>
                <p className="mb-3 flex items-center gap-2 px-1 text-sm font-bold">
                  <span className="h-2 w-2 rounded-full" style={{ background: stage.color }} />
                  {stage.label}
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-stone-500">{items.length}</span>
                </p>
                <div className="space-y-2">
                  {items.length === 0 && <p className="py-3 text-center text-sm text-stone-400">No leads</p>}
                  {items.map((l) => {
                    const mine = l.assigned_to === session.employeeId;
                    const overdue = l.reminder_at && new Date(l.reminder_at).getTime() < Date.now();
                    return (
                      <div key={l.id} className={`${portalCard} rounded-2xl p-3`}>
                        <p className="text-sm font-semibold">
                          {l.name} {mine && <span className="ml-1 rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">Yours</span>}
                        </p>
                        {l.business && <p className="text-xs text-stone-500">{l.business}</p>}
                        {l.phone && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-stone-500">
                            <Phone className="h-3 w-3" /> {l.phone}
                          </p>
                        )}
                        {l.expected_value != null && (showValues || mine) && <p className="mt-1.5 text-xs font-bold text-orange-700">{formatMoney(Number(l.expected_value), l.expected_value_currency as Currency)}</p>}
                        {l.reminder_at && mine && (
                          <p className={`mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold ${overdue ? "text-red-600" : "text-amber-700"}`}>
                            <BellRing className="h-3 w-3" /> Follow up {new Date(l.reminder_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </p>
                        )}
                        {canEdit && (
                          <div className="mt-2">
                            <LeadStageSelect leadId={l.id} status={l.status} stages={stages.map(({ key, label, kind }) => ({ key, label, kind }))} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

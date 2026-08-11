import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, type Lead, type LeadStatus } from "@/lib/leads";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const supabase = createServiceRoleClient();

  const [{ data: allLeads }, { count: dueFollowUps }] = await Promise.all([
    supabase
      .from("leads")
      .select("id, name, email, status, selected_service, service_category, created_at")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("follow_up_completed", false)
      .in("status", ["new", "contacted"])
      .lte("next_follow_up_at", new Date().toISOString()),
  ]);

  const leads = (allLeads ?? []) as Pick<
    Lead,
    "id" | "name" | "email" | "status" | "selected_service" | "service_category" | "created_at"
  >[];

  const counts: Record<LeadStatus, number> = {
    new: 0,
    contacted: 0,
    qualified: 0,
    won: 0,
    lost: 0,
  };
  for (const lead of leads) {
    counts[lead.status as LeadStatus] = (counts[lead.status as LeadStatus] ?? 0) + 1;
  }

  return {
    total: leads.length,
    counts,
    dueFollowUps: dueFollowUps ?? 0,
    recent: leads.slice(0, 5),
  };
}

export default async function AdminDashboardPage() {
  const { total, counts, dueFollowUps, recent } = await getDashboardData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#231F20]">Dashboard</h1>
        <p className="text-[#231F20]/60 text-sm mt-1">Overview of all incoming leads.</p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#1A14A5]/10">
          <p className="text-3xl font-extrabold text-[#1A14A5]">{total}</p>
          <p className="text-sm text-[#231F20]/60 mt-1">Total Leads</p>
        </div>
        {LEAD_STATUSES.map((status) => (
          <div key={status} className="bg-white rounded-2xl p-5 shadow-sm border border-[#1A14A5]/10">
            <p className="text-3xl font-extrabold" style={{ color: LEAD_STATUS_COLORS[status].text }}>
              {counts[status]}
            </p>
            <p className="text-sm text-[#231F20]/60 mt-1">{LEAD_STATUS_LABELS[status]}</p>
          </div>
        ))}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-200">
          <p className="text-3xl font-extrabold text-amber-600">{dueFollowUps}</p>
          <p className="text-sm text-[#231F20]/60 mt-1">Due for follow-up</p>
        </div>
      </div>

      {/* Recent leads */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1A14A5]/10 flex items-center justify-between">
          <h2 className="font-bold text-[#231F20]">Recent Leads</h2>
          <Link href="/admin/leads" className="text-sm font-medium text-[#1A14A5] hover:underline">
            View all →
          </Link>
        </div>
        <ul className="divide-y divide-[#1A14A5]/5">
          {recent.length === 0 && (
            <li className="px-6 py-8 text-center text-sm text-[#231F20]/50">No leads yet.</li>
          )}
          {recent.map((lead) => (
            <li key={lead.id}>
              <Link
                href={`/admin/leads/${lead.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-[#F4F7FE] transition"
              >
                <div>
                  <p className="font-medium text-[#231F20]">{lead.name}</p>
                  <p className="text-sm text-[#231F20]/50">
                    {lead.selected_service || lead.service_category || "—"} &middot; {lead.email}
                  </p>
                </div>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{
                    background: LEAD_STATUS_COLORS[lead.status as LeadStatus].bg,
                    color: LEAD_STATUS_COLORS[lead.status as LeadStatus].text,
                  }}
                >
                  {LEAD_STATUS_LABELS[lead.status as LeadStatus]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

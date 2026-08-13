import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { cn } from "@/lib/utils";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
  LEAD_PRIORITY_LABELS,
  type Lead,
  type LeadStatus,
  type LeadPriority,
} from "@/lib/leads";
import LeadsKanban, { type KanbanLead } from "@/components/admin/LeadsKanban";

export const dynamic = "force-dynamic";

type LeadListItem = Pick<
  Lead,
  | "id"
  | "name"
  | "email"
  | "phone"
  | "status"
  | "source"
  | "selected_service"
  | "service_category"
  | "business"
  | "priority"
  | "expected_value"
  | "created_at"
>;

function isLeadStatus(value: string | undefined): value is LeadStatus {
  return !!value && (LEAD_STATUSES as string[]).includes(value);
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; view?: string }>;
}) {
  const { status: statusParam, view: viewParam } = await searchParams;
  const activeStatus = isLeadStatus(statusParam) ? statusParam : undefined;
  const view = viewParam === "board" ? "board" : "list";

  const supabase = createServiceRoleClient();
  let query = supabase
    .from("leads")
    .select(
      "id, name, email, phone, status, source, selected_service, service_category, business, priority, expected_value, created_at"
    )
    // Consultation bookings have their own dedicated page (/admin/bookings)
    // — kept out of this list so the two lead types don't get mixed.
    .neq("source", "consultation_booking")
    .order("created_at", { ascending: false })
    .limit(200);

  if (activeStatus) {
    query = query.eq("status", activeStatus);
  }

  const { data } = await query;
  const leads = (data ?? []) as LeadListItem[];

  const viewQuery = (params: URLSearchParams) => `/admin/leads?${params.toString()}`;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#231F20]">Leads</h1>
          <p className="text-[#231F20]/60 text-sm mt-1">
            {leads.length} contact lead{leads.length === 1 ? "" : "s"} — consultation bookings are on the{" "}
            <Link href="/admin/bookings" className="text-[#1A14A5] hover:underline">
              Bookings
            </Link>{" "}
            page
          </p>
        </div>

        {/* List / Board toggle */}
        <div className="flex bg-white rounded-full border border-[#1A14A5]/10 p-1">
          <Link
            href={viewQuery(new URLSearchParams({ ...(activeStatus ? { status: activeStatus } : {}), view: "list" }))}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-semibold transition",
              view === "list" ? "bg-[#1A14A5] text-white" : "text-[#231F20]/60"
            )}
          >
            List
          </Link>
          <Link
            href={viewQuery(new URLSearchParams({ ...(activeStatus ? { status: activeStatus } : {}), view: "board" }))}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-semibold transition",
              view === "board" ? "bg-[#1A14A5] text-white" : "text-[#231F20]/60"
            )}
          >
            Board
          </Link>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={viewQuery(new URLSearchParams({ view }))}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-semibold transition",
            !activeStatus ? "bg-[#1A14A5] text-white" : "bg-white text-[#231F20]/70 border border-[#1A14A5]/10"
          )}
        >
          All
        </Link>
        {LEAD_STATUSES.map((status) => (
          <Link
            key={status}
            href={viewQuery(new URLSearchParams({ status, view }))}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold transition",
              activeStatus === status
                ? "bg-[#1A14A5] text-white"
                : "bg-white text-[#231F20]/70 border border-[#1A14A5]/10"
            )}
          >
            {LEAD_STATUS_LABELS[status]}
          </Link>
        ))}
      </div>

      {view === "board" ? (
        <LeadsKanban leads={leads as unknown as KanbanLead[]} />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1A14A5]/10 text-left text-[#231F20]/50">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Contact</th>
                <th className="px-6 py-3 font-medium">Service</th>
                <th className="px-6 py-3 font-medium">Priority</th>
                <th className="px-6 py-3 font-medium">Value</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A14A5]/5">
              {leads.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-[#231F20]/50">
                    No leads found.
                  </td>
                </tr>
              )}
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-[#F4F7FE] transition">
                  <td className="px-6 py-4">
                    <Link href={`/admin/leads/${lead.id}`} className="font-medium text-[#1A14A5] hover:underline">
                      {lead.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-[#231F20]/70">
                    <div>{lead.email}</div>
                    {lead.phone && <div className="text-xs text-[#231F20]/50">{lead.phone}</div>}
                  </td>
                  <td className="px-6 py-4 text-[#231F20]/70">
                    {lead.selected_service || lead.service_category || "—"}
                  </td>
                  <td className="px-6 py-4 text-[#231F20]/70">
                    {LEAD_PRIORITY_LABELS[lead.priority as LeadPriority]}
                  </td>
                  <td className="px-6 py-4 text-[#231F20]/70">
                    {lead.expected_value !== null ? `$${Number(lead.expected_value).toLocaleString()}` : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{
                        background: LEAD_STATUS_COLORS[lead.status as LeadStatus].bg,
                        color: LEAD_STATUS_COLORS[lead.status as LeadStatus].text,
                      }}
                    >
                      {LEAD_STATUS_LABELS[lead.status as LeadStatus]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#231F20]/50 text-xs whitespace-nowrap">
                    {new Date(lead.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

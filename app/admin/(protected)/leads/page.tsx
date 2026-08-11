import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { cn } from "@/lib/utils";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
  type Lead,
  type LeadStatus,
} from "@/lib/leads";

export const dynamic = "force-dynamic";

type LeadListItem = Pick<
  Lead,
  "id" | "name" | "email" | "phone" | "status" | "source" | "selected_service" | "service_category" | "created_at"
>;

function isLeadStatus(value: string | undefined): value is LeadStatus {
  return !!value && (LEAD_STATUSES as string[]).includes(value);
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusParam } = await searchParams;
  const activeStatus = isLeadStatus(statusParam) ? statusParam : undefined;

  const supabase = createServiceRoleClient();
  let query = supabase
    .from("leads")
    .select("id, name, email, phone, status, source, selected_service, service_category, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (activeStatus) {
    query = query.eq("status", activeStatus);
  }

  const { data } = await query;
  const leads = (data ?? []) as LeadListItem[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#231F20]">Leads</h1>
        <p className="text-[#231F20]/60 text-sm mt-1">{leads.length} lead{leads.length === 1 ? "" : "s"}</p>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/leads"
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
            href={`/admin/leads?status=${status}`}
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

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1A14A5]/10 text-left text-[#231F20]/50">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Contact</th>
              <th className="px-6 py-3 font-medium">Service</th>
              <th className="px-6 py-3 font-medium">Source</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A14A5]/5">
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-[#231F20]/50">
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
                <td className="px-6 py-4 text-[#231F20]/50 text-xs">
                  {lead.source === "contact_form" ? "Contact Form" : "Service Form"}
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
    </div>
  );
}

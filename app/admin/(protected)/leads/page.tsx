import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { cn } from "@/lib/utils";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, type LeadStatus } from "@/lib/leads";
import LeadsKanban, { type KanbanLead } from "@/components/admin/LeadsKanban";
import LeadsTable, { type LeadListItem } from "@/components/admin/leads/LeadsTable";

export const dynamic = "force-dynamic";

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
      "id, name, email, phone, status, source, selected_service, service_category, business, priority, expected_value, expected_value_currency, created_at"
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

      {view === "board" ? <LeadsKanban leads={leads as unknown as KanbanLead[]} /> : <LeadsTable leads={leads} />}
    </div>
  );
}

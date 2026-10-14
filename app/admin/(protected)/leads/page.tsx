import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { cn } from "@/lib/utils";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, type LeadStatus } from "@/lib/leads";
import { PageHeader } from "@/components/admin/ui";
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
      <PageHeader
        title="Leads"
        subtitle={
          <>
            {leads.length} contact lead{leads.length === 1 ? "" : "s"} · consultation bookings are on the{" "}
            <Link href="/admin/bookings" className="font-medium text-[#1A14A5] hover:underline">
              Bookings
            </Link>{" "}
            page
          </>
        }
        actions={
          /* List / Board toggle */
          <div className="flex rounded-full border border-[#1A14A5]/10 bg-white p-1">
            {(["list", "board"] as const).map((option) => (
              <Link
                key={option}
                href={viewQuery(
                  new URLSearchParams({ ...(activeStatus ? { status: activeStatus } : {}), view: option })
                )}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition",
                  view === option ? "bg-[#1A14A5] text-white shadow-sm" : "text-[#231F20]/60 hover:text-[#1A14A5]"
                )}
              >
                {option}
              </Link>
            ))}
          </div>
        }
      >
        {/* Status filter pills */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={viewQuery(new URLSearchParams({ view }))}
            className={cn(
              "inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition",
              !activeStatus
                ? "bg-[#1A14A5] text-white shadow-sm"
                : "border border-[#1A14A5]/10 bg-white text-[#231F20]/70 hover:border-[#1A14A5]/30"
            )}
          >
            All
          </Link>
          {LEAD_STATUSES.map((status) => (
            <Link
              key={status}
              href={viewQuery(new URLSearchParams({ status, view }))}
              className={cn(
                "inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition",
                activeStatus === status
                  ? "bg-[#1A14A5] text-white shadow-sm"
                  : "border border-[#1A14A5]/10 bg-white text-[#231F20]/70 hover:border-[#1A14A5]/30"
              )}
            >
              {LEAD_STATUS_LABELS[status]}
            </Link>
          ))}
        </div>
      </PageHeader>

      {view === "board" ? <LeadsKanban leads={leads as unknown as KanbanLead[]} /> : <LeadsTable leads={leads} />}
    </div>
  );
}

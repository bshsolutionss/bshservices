import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { ensureStatusOverrides } from "@/lib/admin/status-overrides";
import { cn } from "@/lib/utils";
import {
  PROJECT_BILLING_LABELS,
  PROJECT_STAGES,
  PROJECT_STAGE_LABELS,
  type Project,
  type ProjectBillingType,
  type ProjectStage,
} from "@/lib/projects";
import { Repeat, Briefcase, Banknote } from "lucide-react";
import { convertToPKR } from "@/lib/currency";
import { getExchangeRates } from "@/lib/admin/exchange-rates";
import { formatMoney } from "@/lib/invoices";
import type { Client } from "@/lib/clients";
import { PageHeader, StatCard } from "@/components/admin/ui";
import RecurringSyncButton from "@/components/admin/RecurringSyncButton";
import ProjectCreateButton from "@/components/admin/projects/ProjectCreateButton";
import ProjectsTable from "@/components/admin/projects/ProjectsTable";

export const dynamic = "force-dynamic";

function isProjectStage(value: string | undefined): value is ProjectStage {
  return !!value && (PROJECT_STAGES as string[]).includes(value);
}

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; archived?: string; billing?: string }>;
}) {
  const { stage: stageParam, archived: archivedParam, billing: billingParam } = await searchParams;
  const activeBilling: ProjectBillingType | undefined =
    billingParam === "monthly" || billingParam === "one_time" ? billingParam : undefined;
  const activeStage = isProjectStage(stageParam) ? stageParam : undefined;
  const showArchived = archivedParam === "1";

  await ensureStatusOverrides();
  const supabase = createServiceRoleClient();
  let query = supabase
    .from("projects")
    .select("*")
    .eq("archived", showArchived)
    .order("created_at", { ascending: false })
    .limit(200);
  if (activeStage) query = query.eq("stage", activeStage);
  if (activeBilling) query = query.eq("billing_type", activeBilling);

  const [{ data: projectsData }, { data: clientsData }, { data: stageCountsData }, { data: retainerData }, rates, { data: employeesData }] = await Promise.all([
    query,
    supabase.from("clients").select("id, company_name").order("company_name"),
    // Stage counts for the filter chips — fetched unfiltered so each chip can
    // show how many projects it holds, which the old chips couldn't.
    supabase.from("projects").select("stage, billing_type").eq("archived", showArchived),
    // Active retainers drive the recurring-revenue tile.
    supabase
      .from("projects")
      .select("monthly_fee, currency")
      .eq("billing_type", "monthly")
      .eq("recurring_active", true)
      .eq("archived", false)
      .neq("stage", "completed"),
    getExchangeRates(),
    supabase.from("employees").select("id, name").eq("status", "active").order("name"),
  ]);
  const teamOptions = (employeesData ?? []) as { id: string; name: string }[];

  const retainers = (retainerData ?? []) as { monthly_fee: number | null; currency: Project["currency"] }[];
  const mrr = retainers.reduce((sum, r) => sum + convertToPKR(Number(r.monthly_fee ?? 0), r.currency, rates), 0);

  const projects = (projectsData ?? []) as Project[];
  const clients = (clientsData ?? []) as Pick<Client, "id" | "company_name">[];
  const clientNames = new Map(clients.map((c) => [c.id, c.company_name]));

  const stageCounts = new Map<string, number>();
  for (const row of (stageCountsData ?? []) as { stage: string; billing_type: string }[]) {
    stageCounts.set(row.stage, (stageCounts.get(row.stage) ?? 0) + 1);
  }
  const totalCount = ((stageCountsData ?? []) as unknown[]).length;

  const stageHref = (stage?: ProjectStage) => {
    const params = new URLSearchParams();
    if (stage) params.set("stage", stage);
    if (showArchived) params.set("archived", "1");
    if (activeBilling) params.set("billing", activeBilling);
    const qs = params.toString();
    return qs ? `/admin/projects?${qs}` : "/admin/projects";
  };

  const billingHref = (billing?: ProjectBillingType) => {
    const params = new URLSearchParams();
    if (activeStage) params.set("stage", activeStage);
    if (showArchived) params.set("archived", "1");
    if (billing) params.set("billing", billing);
    const qs = params.toString();
    return qs ? `/admin/projects?${qs}` : "/admin/projects";
  };

  const chipClass = (active: boolean) =>
    cn(
      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
      active
        ? "bg-[#1A14A5] text-white shadow-sm"
        : "border border-[#1A14A5]/10 bg-white text-[#231F20]/70 hover:border-[#1A14A5]/30"
    );
  const countClass = (active: boolean) =>
    cn("rounded-full px-1.5 text-xs font-bold", active ? "bg-white/20" : "bg-[#F4F7FE] text-[#231F20]/50");

  return (
    <div className="space-y-6">
      <PageHeader
        title={showArchived ? "Archived client projects" : "Client projects"}
        subtitle={`Work you are delivering for clients - what is being built, for whom, and by when. ${projects.length} project${projects.length === 1 ? "" : "s"}${
          activeStage ? ` in ${PROJECT_STAGE_LABELS[activeStage]}` : ""
        }.`}
        actions={
          <>
            <Link
              href={
                showArchived
                  ? stageHref(activeStage)
                  : `/admin/projects?archived=1${activeStage ? `&stage=${activeStage}` : ""}`
              }
              className="text-sm font-medium text-[#231F20]/60 hover:text-[#1A14A5]"
            >
              {showArchived ? "← Active projects" : "View archived →"}
            </Link>
            <RecurringSyncButton />
            <Link href="/admin/retainers" className="text-sm font-medium text-[#231F20]/60 hover:text-[#1A14A5]">
              Retainers →
            </Link>
            <ProjectCreateButton clients={clients} employees={teamOptions} />
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard label="Monthly retainers" value={retainers.length} description="Active recurring projects" icon={Repeat} iconBg="#0d9488" />
          <StatCard
            label="Monthly recurring revenue"
            value={formatMoney(mrr, "PKR")}
            description="Active retainers, converted to PKR"
            icon={Banknote}
            iconBg="#1A14A5"
          />
          <StatCard
            label="One-time projects"
            value={((stageCountsData ?? []) as { billing_type: string }[]).filter((r) => r.billing_type !== "monthly").length}
            description="Fixed-scope work"
            icon={Briefcase}
            iconBg="#7c3aed"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={billingHref()} className={chipClass(!activeBilling)}>
            Any billing
          </Link>
          {(["monthly", "one_time"] as ProjectBillingType[]).map((billing) => (
            <Link key={billing} href={billingHref(billing)} className={chipClass(activeBilling === billing)}>
              {PROJECT_BILLING_LABELS[billing]}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={stageHref()} className={chipClass(!activeStage)}>
            All <span className={countClass(!activeStage)}>{totalCount}</span>
          </Link>
          {PROJECT_STAGES.map((stage) => {
            const active = activeStage === stage;
            return (
              <Link key={stage} href={stageHref(stage)} className={chipClass(active)}>
                {PROJECT_STAGE_LABELS[stage]}
                <span className={countClass(active)}>{stageCounts.get(stage) ?? 0}</span>
              </Link>
            );
          })}
        </div>
      </PageHeader>

      <ProjectsTable
        projects={projects.map((p) => ({ ...p, clientName: clientNames.get(p.client_id) || "-" }))}
        emptyTitle={showArchived ? "No archived projects" : "No projects yet"}
        emptyMessage={showArchived ? "Archived projects appear here." : "Create a project for a client to start tracking tasks and billing."}
        emptyAction={showArchived ? undefined : <ProjectCreateButton clients={clients} employees={teamOptions} label="Create first project" />}
      />
    </div>
  );
}

import Link from "next/link";
import { ExternalLink, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getCompanySettings } from "@/lib/admin/company-settings";
import { getExchangeRates } from "@/lib/admin/exchange-rates";
import { sumToPKR } from "@/lib/currency";
import { formatDate, formatMoney } from "@/lib/invoices";
import {
  PERSONAL_PROJECT_STATUSES,
  PERSONAL_PROJECT_STATUS_COLORS,
  PERSONAL_PROJECT_STATUS_LABELS,
  entryTotals,
  type PersonalProject,
  type PersonalProjectEntry,
  type PersonalProjectStatus,
} from "@/lib/personal-projects";
import { Badge, EmptyState, PageHeader, StatCard } from "@/components/admin/ui";
import PersonalProjectFormModal from "@/components/admin/personal-projects/PersonalProjectFormModal";

export const dynamic = "force-dynamic";

export default async function AdminPersonalProjectsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status: statusParam } = await searchParams;
  const active = PERSONAL_PROJECT_STATUSES.find((s) => s === statusParam) as PersonalProjectStatus | undefined;

  const supabase = createServiceRoleClient();
  const [{ data: projectsData }, { data: entriesData }, rates, company] = await Promise.all([
    supabase.from("personal_projects").select("*").order("created_at", { ascending: false }),
    supabase.from("personal_project_entries").select("project_id, kind, amount"),
    getExchangeRates(),
    getCompanySettings(),
  ]);

  const all = (projectsData ?? []) as PersonalProject[];
  const entriesBy = new Map<string, Pick<PersonalProjectEntry, "kind" | "amount">[]>();
  for (const e of (entriesData ?? []) as (Pick<PersonalProjectEntry, "kind" | "amount"> & { project_id: string })[]) {
    entriesBy.set(e.project_id, [...(entriesBy.get(e.project_id) ?? []), e]);
  }
  const totalsFor = (p: PersonalProject) => entryTotals(entriesBy.get(p.id) ?? []);

  const projects = active ? all.filter((p) => p.status === active) : all;
  const spent = sumToPKR(all.map((p) => ({ amount: totalsFor(p).cost, currency: p.currency })), rates);
  const earned = sumToPKR(all.map((p) => ({ amount: totalsFor(p).revenue, currency: p.currency })), rates);

  const chip = (isActive: boolean) =>
    cn(
      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
      isActive ? "bg-[#1A14A5] text-white shadow-sm" : "border border-[#1A14A5]/10 bg-white text-[#231F20]/70 hover:border-[#1A14A5]/30"
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Personal projects"
        subtitle="Your own products and ideas - separate from client work."
        actions={<PersonalProjectFormModal defaultCurrency={company.default_currency} />}
      >
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Projects" value={all.length} icon={Rocket} iconBg="#1A14A5" description={`${all.filter((p) => p.status === "launched").length} launched`} />
          <StatCard label="Spent" value={formatMoney(spent, "PKR")} iconBg="#E11D48" valueColor="#9F1239" description="All costs, in PKR" />
          <StatCard label="Earned" value={formatMoney(earned, "PKR")} iconBg="#0D9488" valueColor="#0F766E" description="All revenue, in PKR" />
          <StatCard
            label="Net"
            value={formatMoney(earned - spent, "PKR")}
            iconBg={earned - spent >= 0 ? "#0D9488" : "#dc2626"}
            valueColor={earned - spent >= 0 ? "#0F766E" : "#B91C1C"}
            description="Earned minus spent"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/personal-projects" className={chip(!active)}>
            All
          </Link>
          {PERSONAL_PROJECT_STATUSES.map((s) => (
            <Link key={s} href={`/admin/personal-projects?status=${s}`} className={chip(active === s)}>
              {PERSONAL_PROJECT_STATUS_LABELS[s]}
            </Link>
          ))}
        </div>
      </PageHeader>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-[#1A14A5]/10 bg-white shadow-sm">
          <EmptyState
            icon={Rocket}
            title={active ? `No ${PERSONAL_PROJECT_STATUS_LABELS[active].toLowerCase()} projects` : "No personal projects yet"}
            description="Track your own products and side projects - what they cost and what they earn."
            action={!active ? <PersonalProjectFormModal defaultCurrency={company.default_currency} /> : undefined}
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => {
            const t = totalsFor(p);
            return (
              <Link
                key={p.id}
                href={`/admin/personal-projects/${p.id}`}
                className="group rounded-2xl border border-[#1A14A5]/10 bg-white p-5 shadow-sm transition hover:border-[#1A14A5]/30 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-bold text-[#231F20] group-hover:text-[#1A14A5]">{p.name}</p>
                  <Badge label={PERSONAL_PROJECT_STATUS_LABELS[p.status]} colors={PERSONAL_PROJECT_STATUS_COLORS[p.status]} />
                </div>
                {p.description && <p className="mt-1.5 line-clamp-2 text-sm text-[#231F20]/60">{p.description}</p>}
                <dl className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <dt className="text-[#231F20]/45">Spent</dt>
                    <dd className="font-semibold text-red-600">{formatMoney(t.cost, p.currency)}</dd>
                  </div>
                  <div>
                    <dt className="text-[#231F20]/45">Earned</dt>
                    <dd className="font-semibold text-emerald-700">{formatMoney(t.revenue, p.currency)}</dd>
                  </div>
                  <div>
                    <dt className="text-[#231F20]/45">Net</dt>
                    <dd className={cn("font-semibold", t.profit >= 0 ? "text-emerald-700" : "text-red-600")}>
                      {formatMoney(t.profit, p.currency)}
                    </dd>
                  </div>
                </dl>
                <p className="mt-3 flex items-center justify-between text-xs text-[#231F20]/45">
                  <span>{p.target_date ? `Target ${formatDate(p.target_date)}` : p.start_date ? `Started ${formatDate(p.start_date)}` : ""}</span>
                  {p.url && <ExternalLink className="h-3.5 w-3.5" />}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

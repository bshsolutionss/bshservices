import Link from "next/link";
import { Repeat } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getExchangeRates } from "@/lib/admin/exchange-rates";
import { sumToPKR } from "@/lib/currency";
import { formatDate, formatMoney, type Currency } from "@/lib/invoices";
import { todayInPkt } from "@/lib/availability";
import type { Project } from "@/lib/projects";
import { Badge, EmptyState, PageHeader } from "@/components/admin/ui";
import ProjectCreateButton from "@/components/admin/projects/ProjectCreateButton";

export const dynamic = "force-dynamic";

/** The next date a retainer is billed: this month if its day hasn't passed yet, otherwise next month. */
function nextBillDate(billingDay: number, today: string): string {
  const [y, m, d] = today.split("-").map(Number);
  const [year, month] = d <= billingDay ? [y, m] : m === 12 ? [y + 1, 1] : [y, m + 1];
  return `${year}-${String(month).padStart(2, "0")}-${String(billingDay).padStart(2, "0")}`;
}

export default async function RetainersPage() {
  const service = createServiceRoleClient();
  const today = todayInPkt();
  const [{ data: projectsData }, { data: clients }, { data: employees }, rates] = await Promise.all([
    service.from("projects").select("*").eq("billing_type", "monthly").eq("archived", false).order("created_at", { ascending: false }),
    service.from("clients").select("id, company_name").order("company_name"),
    service.from("employees").select("id, name").eq("status", "active").order("name"),
    getExchangeRates(),
  ]);
  const projects = (projectsData ?? []) as Project[];
  const clientName = new Map((clients ?? []).map((c) => [c.id as string, c.company_name as string]));

  // What each retainer has actually paid so far: payments on any invoice linked to it.
  const ids = projects.map((p) => p.id);
  const { data: invoices } = ids.length ? await service.from("invoices").select("id, project_id").in("project_id", ids) : { data: [] };
  const invoiceIds = (invoices ?? []).map((i) => i.id as string);
  const { data: payments } = invoiceIds.length ? await service.from("payments").select("invoice_id, amount").in("invoice_id", invoiceIds) : { data: [] };
  const projectOfInvoice = new Map((invoices ?? []).map((i) => [i.id as string, i.project_id as string]));
  const paid = new Map<string, number>();
  for (const p of payments ?? []) {
    const pid = projectOfInvoice.get(p.invoice_id as string);
    if (pid) paid.set(pid, (paid.get(pid) ?? 0) + Number(p.amount));
  }

  const isActive = (p: Project) => p.recurring_active && p.stage !== "completed";
  const active = projects.filter(isActive);
  const mrr = sumToPKR(active.map((p) => ({ amount: Number(p.monthly_fee ?? 0), currency: p.currency })), rates);

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/admin/projects"
        backLabel="Back to Projects"
        title="Retainers"
        subtitle="Monthly-billed clients with no fixed deadline"
        actions={
          <ProjectCreateButton
            clients={(clients ?? []).map((c) => ({ id: c.id as string, company_name: c.company_name as string }))}
            employees={(employees ?? []) as { id: string; name: string }[]}
            defaultBillingType="monthly"
            label="New retainer"
          />
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Active", value: String(active.length) },
          { label: "MRR", value: formatMoney(mrr, "PKR") },
          { label: "Total", value: String(projects.length) },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-[#1A14A5]/10 bg-white p-5 shadow-sm">
            <p className="text-xs text-[#231F20]/50">{c.label}</p>
            <p className="mt-1 text-3xl font-extrabold">{c.value}</p>
          </div>
        ))}
      </div>

      {projects.length === 0 ? (
        <EmptyState icon={Repeat} title="No retainers yet" description="A retainer is a project billed every month. Create one to track recurring revenue and have invoices drafted for you." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => {
            const state = p.stage === "completed" ? "Ended" : p.recurring_active ? "Active" : "Paused";
            const colors = state === "Active" ? { bg: "#D1FAE5", text: "#065F46" } : state === "Paused" ? { bg: "#FEF3C7", text: "#92400E" } : { bg: "#F1F1F1", text: "#4B5563" };
            return (
              <Link key={p.id} href={`/admin/projects/${p.id}`} className="block rounded-2xl border border-[#1A14A5]/10 bg-white p-5 shadow-sm transition hover:border-[#1A14A5]/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold">{p.name}</p>
                    <p className="truncate text-sm text-[#231F20]/55">{clientName.get(p.client_id) ?? "-"}</p>
                  </div>
                  <Badge label={state} colors={colors} />
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-[#231F20]/50">Monthly</p>
                    <p className="text-xl font-extrabold">{formatMoney(Number(p.monthly_fee ?? 0), p.currency as Currency)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#231F20]/50">Billing day</p>
                    <p className="text-lg font-bold">{p.billing_day}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[#1A14A5]/10 pt-3 text-xs">
                  <span className="text-[#231F20]/55">{state === "Active" ? `Next ${formatDate(nextBillDate(p.billing_day, today))}` : "Not billing"}</span>
                  <span className="font-semibold text-emerald-700">Paid {formatMoney(paid.get(p.id) ?? 0, p.currency as Currency)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

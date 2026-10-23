import { createServiceRoleClient } from "@/lib/supabase/service";
import { ensureStatusOverrides } from "@/lib/admin/status-overrides";
import { ensureLeadStages } from "@/lib/admin/lead-stages";
import { getExchangeRates } from "@/lib/admin/exchange-rates";
import { sumToPKR } from "@/lib/currency";
import { formatMoney } from "@/lib/invoices";
import { stageKeys } from "@/lib/lead-stages";
import { SITE_URL } from "@/lib/site";
import LeadsWorkspace, { type WorkspaceLead } from "@/components/admin/leads/LeadsWorkspace";

export const dynamic = "force-dynamic";

type Row = WorkspaceLead & { status_updated_at: string };

export default async function AdminLeadsPage() {
  await ensureStatusOverrides();
  const stages = await ensureLeadStages();
  const supabase = createServiceRoleClient();

  const [{ data }, { data: employees }, rates] = await Promise.all([
    supabase
      .from("leads")
      .select(
        "id, name, email, phone, status, source, selected_service, service_category, business, priority, expected_value, expected_value_currency, created_at, assigned_to, location, reminder_at, status_updated_at"
      )
      // Consultation bookings have their own page (/admin/bookings) - kept out so the two lead types don't mix.
      .neq("source", "consultation_booking")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase.from("employees").select("id, name").eq("status", "active").order("name"),
    getExchangeRates(),
  ]);
  const leads = (data ?? []) as Row[];

  const open = new Set(stageKeys(stages, "open"));
  const won = new Set(stageKeys(stages, "won"));
  const lost = new Set(stageKeys(stages, "lost"));
  const openLeads = leads.filter((l) => open.has(l.status));
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const wonCount = leads.filter((l) => won.has(l.status)).length;
  const lostCount = leads.filter((l) => lost.has(l.status)).length;

  const pipeline = sumToPKR(
    openLeads.filter((l) => l.expected_value != null).map((l) => ({ amount: Number(l.expected_value), currency: l.expected_value_currency })),
    rates
  );

  return (
    <LeadsWorkspace
      leads={leads}
      stages={stages}
      employees={(employees ?? []) as { id: string; name: string }[]}
      stats={{
        open: openLeads.length,
        pipeline: formatMoney(pipeline, "PKR"),
        wonThisMonth: leads.filter((l) => won.has(l.status) && new Date(l.status_updated_at) >= monthStart).length,
        winRate: wonCount + lostCount > 0 ? Math.round((wonCount / (wonCount + lostCount)) * 100) : null,
      }}
      siteUrl={SITE_URL}
    />
  );
}

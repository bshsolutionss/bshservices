import { createServiceRoleClient } from "@/lib/supabase/service";
import { ensureLeadStages } from "@/lib/admin/lead-stages";
import { SITE_URL } from "@/lib/site";
import { PageHeader } from "@/components/admin/ui";
import LeadSourcesManager from "@/components/admin/leads/LeadSourcesManager";
import type { LeadSourceRow } from "@/lib/lead-sources";

export const dynamic = "force-dynamic";

export default async function LeadSourcesPage() {
  const service = createServiceRoleClient();
  const [stages, { data: sources }, { data: counts }] = await Promise.all([
    ensureLeadStages(),
    service.from("lead_sources").select("*").order("created_at"),
    service.from("leads").select("source_id").not("source_id", "is", null),
  ]);
  const leads: Record<string, number> = {};
  for (const c of counts ?? []) leads[c.source_id] = (leads[c.source_id] ?? 0) + 1;

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/admin/leads"
        backLabel="Back to pipeline"
        title="Lead sources"
        subtitle="Leads from your ads, marketplaces and website land on your board in seconds."
      />
      <LeadSourcesManager sources={(sources ?? []) as LeadSourceRow[]} leadCounts={leads} stages={stages} siteUrl={SITE_URL} />
    </div>
  );
}

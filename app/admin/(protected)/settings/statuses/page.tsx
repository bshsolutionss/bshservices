import { refreshStatusOverrides } from "@/lib/admin/status-overrides";
import { describeStatuses } from "@/lib/status-config";
import { PageHeader } from "@/components/admin/ui";
import StatusLabelsManager from "@/components/admin/settings/StatusLabelsManager";

export const dynamic = "force-dynamic";

export default async function StatusesSettingsPage() {
  const rows = await refreshStatusOverrides();
  return (
    <div className="space-y-6">
      <PageHeader title="Statuses & stages" subtitle="Rename and recolour lead stages, project stages, task and invoice statuses." />
      <div className="max-w-3xl">
        <StatusLabelsManager lists={describeStatuses(rows)} />
      </div>
    </div>
  );
}

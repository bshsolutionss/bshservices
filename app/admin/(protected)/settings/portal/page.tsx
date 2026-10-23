import { getPortalWelcome } from "@/lib/portal/welcome";
import { PageHeader } from "@/components/admin/ui";
import PortalSettingsForm from "@/components/admin/settings/PortalSettingsForm";

export const dynamic = "force-dynamic";

export default async function PortalSettingsPage() {
  const settings = await getPortalWelcome();
  return (
    <div className="space-y-6">
      <PageHeader title="Client portal" subtitle="The welcome walkthrough and onboarding checklist every client sees." />
      <div className="max-w-3xl">
        <PortalSettingsForm initial={settings} />
      </div>
    </div>
  );
}

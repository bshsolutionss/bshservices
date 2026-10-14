import { getCompanySettings } from "@/lib/admin/company-settings";
import { PageHeader } from "@/components/admin/ui";
import CompanySettingsForm from "@/components/admin/settings/CompanySettingsForm";

export const dynamic = "force-dynamic";

export default async function CompanySettingsPage() {
  const settings = await getCompanySettings();
  return (
    <div className="space-y-6">
      <PageHeader title="Company" subtitle="Your business details and default currency." />
      <div className="max-w-3xl">
        <CompanySettingsForm initial={settings} />
      </div>
    </div>
  );
}

import { PageHeader } from "@/components/admin/ui";
import OptionListManager from "@/components/admin/settings/OptionListManager";

export const dynamic = "force-dynamic";

export default function ListsSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Lists"
        subtitle="Edit the dropdown options used across the panel - categories, lead sources, investment types and more."
      />
      <OptionListManager />
    </div>
  );
}

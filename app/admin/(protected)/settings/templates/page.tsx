import { createServiceRoleClient } from "@/lib/supabase/service";
import type { MessageTemplate } from "@/lib/communications";
import { PageHeader } from "@/components/admin/ui";
import TemplatesManager from "@/components/admin/settings/TemplatesManager";

export const dynamic = "force-dynamic";

export default async function TemplatesSettingsPage() {
  const supabase = createServiceRoleClient();
  const { data } = await supabase.from("message_templates").select("*").order("sort_order");
  return (
    <div className="space-y-6">
      <PageHeader title="Message templates" subtitle="Ready-made messages for emailing clients." />
      <div className="max-w-3xl">
        <TemplatesManager templates={(data ?? []) as MessageTemplate[]} />
      </div>
    </div>
  );
}

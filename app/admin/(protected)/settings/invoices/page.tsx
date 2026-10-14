import { getInvoiceSettings } from "@/lib/admin/invoice-settings";
import { PageHeader } from "@/components/admin/ui";
import InvoiceSettingsForm from "@/components/admin/settings/InvoiceSettingsForm";

export const dynamic = "force-dynamic";

export default async function InvoiceSettingsPage() {
  const settings = await getInvoiceSettings();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoice settings"
        subtitle="Defaults for new invoices and the payment details clients see on the PDF."
      />
      <div className="max-w-3xl">
        <InvoiceSettingsForm initial={settings} />
      </div>
    </div>
  );
}

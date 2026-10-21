import { getExchangeRates } from "@/lib/admin/exchange-rates";
import { PageHeader } from "@/components/admin/ui";
import ExchangeRatesForm from "@/components/admin/settings/ExchangeRatesForm";

export const dynamic = "force-dynamic";

export default async function ExchangeRatesPage() {
  const rates = await getExchangeRates();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exchange rates"
        subtitle="PKR is your standard currency. These rates convert USD, CAD and AUD amounts into one PKR total on the dashboard and reports. Update them when real rates move - they are not fetched automatically."
      />

      <ExchangeRatesForm rates={rates} />
    </div>
  );
}

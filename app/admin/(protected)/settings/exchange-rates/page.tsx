import { getExchangeRates } from "@/lib/admin/exchange-rates";
import ExchangeRatesForm from "@/components/admin/settings/ExchangeRatesForm";

export const dynamic = "force-dynamic";

export default async function ExchangeRatesPage() {
  const rates = await getExchangeRates();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#231F20]">Exchange Rates</h1>
        <p className="text-[#231F20]/60 text-sm mt-1">
          PKR is the business&apos;s standard currency — these rates are what the dashboard KPIs use to convert
          USD/CAD/AUD amounts into one PKR total. Update them here whenever real rates move; nothing here is fetched
          automatically.
        </p>
      </div>

      <ExchangeRatesForm rates={rates} />
    </div>
  );
}

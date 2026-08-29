import { createServiceRoleClient } from "@/lib/supabase/service";
import { CURRENCIES, type Currency } from "@/lib/invoices";
import { FALLBACK_RATES_TO_PKR, type ExchangeRates } from "@/lib/currency";

/**
 * Reads the admin-maintained `exchange_rates` table (see
 * supabase/migrations/0009_currency.sql). Any currency missing a row falls
 * back to FALLBACK_RATES_TO_PKR rather than throwing — a KPI showing a
 * slightly-stale conversion is far better than the dashboard erroring out.
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase.from("exchange_rates").select("currency, rate_to_pkr");

  const rates = { ...FALLBACK_RATES_TO_PKR };
  for (const row of (data ?? []) as { currency: Currency; rate_to_pkr: number }[]) {
    if ((CURRENCIES as string[]).includes(row.currency)) {
      rates[row.currency] = Number(row.rate_to_pkr);
    }
  }
  return rates;
}

import { createServiceRoleClient } from "@/lib/supabase/service";
import { CURRENCIES, type Currency } from "@/lib/invoices";

/** Your business profile, edited under Settings > Company (app_settings key "company"). Printed on invoices. */
export interface CompanySettings {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  /** Pre-selected currency on new invoices, projects and expenses. */
  default_currency: Currency;
}

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  name: "BSH Solutions",
  tagline: "Business Smart Hub",
  email: "info@bshsolutions.net",
  phone: "+92 312 8994968",
  address: "Karachi, Pakistan",
  website: "bshsolutions.net",
  default_currency: "PKR",
};

export const COMPANY_SETTINGS_KEY = "company";

export async function getCompanySettings(): Promise<CompanySettings> {
  try {
    const supabase = createServiceRoleClient();
    const { data } = await supabase.from("app_settings").select("value").eq("key", COMPANY_SETTINGS_KEY).maybeSingle();
    const merged = { ...DEFAULT_COMPANY_SETTINGS, ...((data?.value as Partial<CompanySettings>) ?? {}) };
    if (!(CURRENCIES as string[]).includes(merged.default_currency)) merged.default_currency = "PKR";
    return merged;
  } catch {
    return { ...DEFAULT_COMPANY_SETTINGS };
  }
}

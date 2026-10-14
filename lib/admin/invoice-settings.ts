import { createServiceRoleClient } from "@/lib/supabase/service";

/** Business-wide invoice defaults, edited under Settings > Invoices (app_settings key "invoice"). */
export interface InvoiceSettings {
  /** Pre-filled in the invoice builder and on retainer invoices. */
  default_tax_rate: number;
  /** Days between issue and due date when no date is picked. */
  default_due_days: number;
  /** Printed on every invoice unless the invoice has its own terms. */
  default_terms: string;
  /** Bank / wallet details, printed on the PDF so clients know where to pay. */
  payment_details: string;
  /** Default message in the "email invoice" dialog. */
  email_message: string;
}

export const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  default_tax_rate: 0,
  default_due_days: 7,
  default_terms: "",
  payment_details: "",
  email_message: "Please find your invoice attached. Thank you for your business!",
};

export const INVOICE_SETTINGS_KEY = "invoice";

export async function getInvoiceSettings(): Promise<InvoiceSettings> {
  try {
    const supabase = createServiceRoleClient();
    const { data } = await supabase.from("app_settings").select("value").eq("key", INVOICE_SETTINGS_KEY).maybeSingle();
    return { ...DEFAULT_INVOICE_SETTINGS, ...((data?.value as Partial<InvoiceSettings>) ?? {}) };
  } catch {
    return { ...DEFAULT_INVOICE_SETTINGS };
  }
}

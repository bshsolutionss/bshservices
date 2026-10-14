import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getCompanySettings } from "@/lib/admin/company-settings";
import { INVOICE_SETTINGS_KEY, getInvoiceSettings, type InvoiceSettings } from "@/lib/admin/invoice-settings";

export async function GET() {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  const [settings, company] = await Promise.all([getInvoiceSettings(), getCompanySettings()]);
  return NextResponse.json({ ok: true, settings, default_currency: company.default_currency });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  let payload: Partial<InvoiceSettings>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const next = await getInvoiceSettings();

  if (payload.default_tax_rate !== undefined) {
    const rate = Number(payload.default_tax_rate);
    if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
      return NextResponse.json({ ok: false, error: "Tax rate must be between 0 and 100." }, { status: 400 });
    }
    next.default_tax_rate = rate;
  }
  if (payload.default_due_days !== undefined) {
    const days = Number(payload.default_due_days);
    if (!Number.isInteger(days) || days < 0 || days > 365) {
      return NextResponse.json({ ok: false, error: "Due days must be a whole number from 0 to 365." }, { status: 400 });
    }
    next.default_due_days = days;
  }
  if (payload.default_terms !== undefined) next.default_terms = String(payload.default_terms).slice(0, 3000);
  if (payload.payment_details !== undefined) next.payment_details = String(payload.payment_details).slice(0, 3000);
  if (payload.email_message !== undefined) next.email_message = String(payload.email_message).slice(0, 3000);

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("app_settings")
    .upsert({ key: INVOICE_SETTINGS_KEY, value: next, updated_at: new Date().toISOString() });
  if (error) {
    console.error("[api/admin/settings/invoice] save failed:", error);
    return NextResponse.json(
      { ok: false, error: "Could not save. Run supabase/migrations/0012_business_management.sql first." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, settings: next });
}

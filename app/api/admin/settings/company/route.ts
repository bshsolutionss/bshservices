import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { COMPANY_SETTINGS_KEY, getCompanySettings, type CompanySettings } from "@/lib/admin/company-settings";
import { CURRENCIES } from "@/lib/invoices";

export async function GET() {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  return NextResponse.json({ ok: true, settings: await getCompanySettings() });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const payload = (await request.json().catch(() => null)) as Partial<CompanySettings> | null;
  if (!payload) return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });

  const next = await getCompanySettings();
  for (const field of ["name", "tagline", "email", "phone", "address", "website"] as const) {
    if (payload[field] !== undefined) next[field] = String(payload[field]).trim().slice(0, 200);
  }
  if (!next.name) return NextResponse.json({ ok: false, error: "Company name is required." }, { status: 400 });
  if (next.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) {
    return NextResponse.json({ ok: false, error: "That email address doesn't look right." }, { status: 400 });
  }
  if (payload.default_currency !== undefined) {
    if (!(CURRENCIES as string[]).includes(payload.default_currency)) {
      return NextResponse.json({ ok: false, error: "Invalid currency." }, { status: 400 });
    }
    next.default_currency = payload.default_currency;
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("app_settings")
    .upsert({ key: COMPANY_SETTINGS_KEY, value: next, updated_at: new Date().toISOString() });
  if (error) {
    console.error("[api/admin/settings/company] save failed:", error);
    return NextResponse.json(
      { ok: false, error: "Could not save. Run supabase/migrations/0012_business_management.sql first." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true, settings: next });
}

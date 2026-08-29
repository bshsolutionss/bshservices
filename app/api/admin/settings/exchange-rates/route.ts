import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { CURRENCIES, type Currency } from "@/lib/invoices";
import { getExchangeRates } from "@/lib/admin/exchange-rates";

export async function GET() {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const rates = await getExchangeRates();
  return NextResponse.json({ ok: true, rates });
}

interface UpdatePayload {
  rates: Partial<Record<Currency, number>>;
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  let payload: UpdatePayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const entries = Object.entries(payload.rates ?? {}) as [Currency, number][];
  if (entries.length === 0) {
    return NextResponse.json({ ok: false, error: "No rates provided." }, { status: 400 });
  }

  for (const [currency, rate] of entries) {
    if (!(CURRENCIES as string[]).includes(currency)) {
      return NextResponse.json({ ok: false, error: `Invalid currency: ${currency}` }, { status: 400 });
    }
    if (!Number.isFinite(rate) || rate <= 0) {
      return NextResponse.json({ ok: false, error: `Invalid rate for ${currency}.` }, { status: 400 });
    }
  }

  // PKR is the base — it must always convert 1:1 with itself, never editable.
  const rows = entries
    .filter(([currency]) => currency !== "PKR")
    .map(([currency, rate]) => ({ currency, rate_to_pkr: rate, updated_at: new Date().toISOString() }));

  if (rows.length === 0) {
    return NextResponse.json({ ok: false, error: "PKR's rate is fixed at 1 and can't be changed." }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { error } = await service.from("exchange_rates").upsert(rows, { onConflict: "currency" });

  if (error) {
    console.error("[api/admin/settings/exchange-rates] upsert failed:", error);
    return NextResponse.json({ ok: false, error: "Could not save exchange rates." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

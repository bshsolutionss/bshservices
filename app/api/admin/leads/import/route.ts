import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { loadLeadStages } from "@/lib/admin/lead-stages";
import { CURRENCIES, type Currency } from "@/lib/invoices";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ROWS = 500;

interface Row {
  name?: string;
  phone?: string;
  email?: string;
  company?: string;
  location?: string;
  source?: string;
  value?: string | number;
  currency?: string;
  notes?: string;
}

const clip = (v: unknown, max: number) => (typeof v === "string" || typeof v === "number" ? String(v).trim().slice(0, max) || null : null);

/** Bulk-adds leads from a CSV the browser has already parsed. Bad rows are skipped and reported, never half-saved. */
export async function POST(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const payload = (await request.json().catch(() => null)) as { rows?: Row[] } | null;
  const rows = Array.isArray(payload?.rows) ? payload.rows : [];
  if (rows.length === 0) return NextResponse.json({ ok: false, error: "The file has no rows." }, { status: 400 });
  if (rows.length > MAX_ROWS) return NextResponse.json({ ok: false, error: `Import up to ${MAX_ROWS} leads at a time.` }, { status: 400 });

  const stages = await loadLeadStages();
  const first = stages.find((s) => s.kind === "open") ?? stages[0];

  const valid: Record<string, unknown>[] = [];
  const skipped: { row: number; reason: string }[] = [];
  rows.forEach((r, i) => {
    const name = clip(r.name, 200);
    const phone = clip(r.phone, 60);
    const email = clip(r.email, 320)?.toLowerCase() ?? null;
    if (!name) return skipped.push({ row: i + 1, reason: "no name" });
    if (!phone && !email) return skipped.push({ row: i + 1, reason: "no phone or email" });
    if (email && !EMAIL_RE.test(email)) return skipped.push({ row: i + 1, reason: "invalid email" });
    const value = r.value === undefined || r.value === "" ? null : Number(String(r.value).replace(/[^\d.]/g, ""));
    const currency = (CURRENCIES as string[]).includes(String(r.currency).toUpperCase()) ? (String(r.currency).toUpperCase() as Currency) : "PKR";
    valid.push({
      name,
      phone,
      email,
      business: clip(r.company, 200),
      location: clip(r.location, 200),
      message: clip(r.notes, 5000),
      source: "manual",
      lead_source_detail: clip(r.source, 100) ?? "Imported",
      status: first.key,
      priority: "medium",
      expected_value: value !== null && Number.isFinite(value) ? value : null,
      expected_value_currency: currency,
      follow_up_completed: true,
    });
  });

  if (valid.length === 0) return NextResponse.json({ ok: false, error: "No usable rows. Each lead needs a name and a phone or email.", skipped }, { status: 400 });

  const { error } = await createServiceRoleClient().from("leads").insert(valid);
  if (error) {
    console.error("[api/admin/leads/import] failed:", error);
    return NextResponse.json({ ok: false, error: "Could not import. Run supabase/migrations/0016_leads_pipeline.sql first." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, imported: valid.length, skipped });
}

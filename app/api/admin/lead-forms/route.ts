import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { DEFAULT_QUESTIONS, newSlug, type LeadForm } from "@/lib/lead-forms";

export async function GET() {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  const service = createServiceRoleClient();
  const { data: forms } = await service.from("lead_forms").select("*").order("created_at");
  const { data: counts } = await service.from("leads").select("form_id").not("form_id", "is", null);
  const submissions: Record<string, number> = {};
  for (const c of counts ?? []) submissions[c.form_id] = (submissions[c.form_id] ?? 0) + 1;
  return NextResponse.json({ ok: true, forms: (forms ?? []) as LeadForm[], submissions });
}

/** Creates a form with sensible starter questions - the person edits them afterwards. */
export async function POST(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  const p = (await request.json().catch(() => null)) as { name?: string } | null;
  const name = (p?.name ?? "").trim().slice(0, 80) || "Get in touch";

  const { data, error } = await createServiceRoleClient()
    .from("lead_forms")
    .insert({ slug: newSlug(), name, heading: name, questions: DEFAULT_QUESTIONS })
    .select("*")
    .single();
  if (error || !data) {
    console.error("[api/admin/lead-forms] create failed:", error);
    return NextResponse.json({ ok: false, error: "Could not create the form. Run supabase/migrations/0016_leads_pipeline.sql first." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, form: data as LeadForm });
}

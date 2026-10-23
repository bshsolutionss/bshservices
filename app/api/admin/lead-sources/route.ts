import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { newToken, SOURCE_TYPES, type LeadSourceRow, type LeadSourceType } from "@/lib/lead-sources";

export async function GET() {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  const service = createServiceRoleClient();
  const { data: sources } = await service.from("lead_sources").select("*").order("created_at");
  const { data: counts } = await service.from("leads").select("source_id").not("source_id", "is", null);
  const leads: Record<string, number> = {};
  for (const c of counts ?? []) leads[c.source_id] = (leads[c.source_id] ?? 0) + 1;
  return NextResponse.json({ ok: true, sources: (sources ?? []) as LeadSourceRow[], leads });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  const p = (await request.json().catch(() => null)) as { type?: LeadSourceType; name?: string } | null;
  const def = SOURCE_TYPES.find((t) => t.type === p?.type);
  if (!def) return NextResponse.json({ ok: false, error: "Choose a source type." }, { status: 400 });

  const { data, error } = await createServiceRoleClient()
    .from("lead_sources")
    .insert({ type: def.type, name: (p?.name ?? "").trim().slice(0, 80) || def.title, token: newToken() })
    .select("*")
    .single();
  if (error || !data) {
    console.error("[api/admin/lead-sources] create failed:", error);
    return NextResponse.json({ ok: false, error: "Could not connect. Run supabase/migrations/0016_leads_pipeline.sql first." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, source: data });
}

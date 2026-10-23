import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getPortalWelcome, PORTAL_WELCOME_KEY, type ChecklistItem, type PortalWelcomeSettings } from "@/lib/portal/welcome";

export async function GET() {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  return NextResponse.json({ ok: true, settings: await getPortalWelcome() });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const p = (await request.json().catch(() => null)) as Partial<PortalWelcomeSettings> | null;
  if (!p) return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });

  const text = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
  const checklist: ChecklistItem[] = (Array.isArray(p.checklist) ? p.checklist : [])
    .map((c, i) => ({ id: text(c?.id, 40) || `item-${i + 1}`, label: text(c?.label, 160), hint: text(c?.hint, 160) || undefined }))
    .filter((c) => c.label)
    .slice(0, 12);

  const next: PortalWelcomeSettings = {
    how_we_work: text(p.how_we_work, 2000),
    what_happens_next: text(p.what_happens_next, 2000),
    communication: text(p.communication, 2000),
    checklist,
  };
  if (!next.how_we_work || !next.what_happens_next || !next.communication) {
    return NextResponse.json({ ok: false, error: "Fill in all three welcome texts." }, { status: 400 });
  }
  if (checklist.length === 0) return NextResponse.json({ ok: false, error: "Keep at least one checklist item." }, { status: 400 });

  const { error } = await createServiceRoleClient().from("app_settings").upsert({ key: PORTAL_WELCOME_KEY, value: next, updated_at: new Date().toISOString() });
  if (error) {
    console.error("[api/admin/settings/portal] save failed:", error);
    return NextResponse.json({ ok: false, error: "Could not save. Run supabase/migrations/0012_business_management.sql first." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, settings: next });
}

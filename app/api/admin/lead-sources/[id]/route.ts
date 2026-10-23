import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { loadLeadStages } from "@/lib/admin/lead-stages";
import { newToken } from "@/lib/lead-sources";
import { cleanText, isUuid } from "@/lib/portal/admin-input";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });

  const p = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!p) return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (p.name !== undefined) {
    const name = cleanText(p.name, 80);
    if (!name) return NextResponse.json({ ok: false, error: "Give the source a name." }, { status: 400 });
    updates.name = name;
  }
  if (p.active !== undefined) updates.active = p.active === true;
  // Rotating the token invalidates the old URL - use it if a URL was pasted somewhere it shouldn't be.
  if (p.rotate === true) updates.token = newToken();
  if (p.stage_key !== undefined) {
    if (!p.stage_key) updates.stage_key = null;
    else {
      const stage = (await loadLeadStages()).find((s) => s.key === p.stage_key && s.kind === "open");
      if (!stage) return NextResponse.json({ ok: false, error: "Pick one of your open stages." }, { status: 400 });
      updates.stage_key = stage.key;
    }
  }
  if (Object.keys(updates).length === 0) return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });

  const { error } = await createServiceRoleClient().from("lead_sources").update(updates).eq("id", id);
  return error ? NextResponse.json({ ok: false, error: "Could not save." }, { status: 500 }) : NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  const { error } = await createServiceRoleClient().from("lead_sources").delete().eq("id", id);
  return error ? NextResponse.json({ ok: false, error: "Could not disconnect." }, { status: 500 }) : NextResponse.json({ ok: true });
}

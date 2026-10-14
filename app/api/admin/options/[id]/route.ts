import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id } = await params;
  const payload = (await request.json().catch(() => null)) as {
    label?: string;
    color?: string | null;
    active?: boolean;
  } | null;
  if (!payload) return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });

  // `value` is never edited: existing expenses/projects/etc. store it, so renaming the label is safe but the key must stay put.
  const updates: Record<string, unknown> = {};
  if (payload.label !== undefined) {
    const label = payload.label.trim().slice(0, 80);
    if (!label) return NextResponse.json({ ok: false, error: "Name can't be empty." }, { status: 400 });
    updates.label = label;
  }
  if (payload.color !== undefined) {
    updates.color = payload.color && /^#[0-9a-fA-F]{6}$/.test(payload.color) ? payload.color : null;
  }
  if (payload.active !== undefined) updates.active = !!payload.active;
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { error } = await service.from("app_options").update(updates).eq("id", id);
  if (error) {
    console.error("[api/admin/options] update failed:", error);
    return NextResponse.json({ ok: false, error: "Update failed." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id } = await params;
  const service = createServiceRoleClient();
  const { error } = await service.from("app_options").delete().eq("id", id);
  if (error) {
    console.error("[api/admin/options] delete failed:", error);
    return NextResponse.json({ ok: false, error: "Could not delete." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

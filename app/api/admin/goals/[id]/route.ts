import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id } = await params;
  const payload = (await request.json().catch(() => null)) as {
    title?: string;
    target_value?: number;
    current_value?: number;
    unit?: string | null;
    notes?: string | null;
  } | null;
  if (!payload) return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (payload.title !== undefined) {
    const title = payload.title.trim().slice(0, 120);
    if (!title) return NextResponse.json({ ok: false, error: "Title can't be empty." }, { status: 400 });
    updates.title = title;
  }
  if (payload.target_value !== undefined) {
    const target = Number(payload.target_value);
    if (!Number.isFinite(target) || target <= 0) {
      return NextResponse.json({ ok: false, error: "Enter a target greater than zero." }, { status: 400 });
    }
    updates.target_value = target;
  }
  if (payload.current_value !== undefined) {
    const current = Number(payload.current_value);
    if (!Number.isFinite(current) || current < 0) {
      return NextResponse.json({ ok: false, error: "Progress can't be negative." }, { status: 400 });
    }
    updates.current_value = current;
  }
  if (payload.unit !== undefined) updates.unit = payload.unit?.trim().slice(0, 30) || null;
  if (payload.notes !== undefined) updates.notes = payload.notes?.trim().slice(0, 2000) || null;
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { error } = await service.from("goals").update(updates).eq("id", id);
  if (error) {
    console.error("[api/admin/goals] update failed:", error);
    return NextResponse.json({ ok: false, error: "Update failed." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id } = await params;
  const service = createServiceRoleClient();
  const { error } = await service.from("goals").delete().eq("id", id);
  if (error) {
    console.error("[api/admin/goals] delete failed:", error);
    return NextResponse.json({ ok: false, error: "Could not delete the goal." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

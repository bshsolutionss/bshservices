import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id } = await params;
  const payload = (await request.json().catch(() => null)) as {
    subject?: string | null;
    summary?: string | null;
    follow_up_on?: string | null;
    follow_up_done?: boolean;
  } | null;
  if (!payload) return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (payload.subject !== undefined) updates.subject = payload.subject?.trim().slice(0, 200) || null;
  if (payload.summary !== undefined) updates.summary = payload.summary?.trim().slice(0, 5000) || null;
  if (payload.follow_up_on !== undefined) {
    if (payload.follow_up_on && !/^\d{4}-\d{2}-\d{2}$/.test(payload.follow_up_on)) {
      return NextResponse.json({ ok: false, error: "Invalid follow-up date." }, { status: 400 });
    }
    updates.follow_up_on = payload.follow_up_on || null;
    updates.follow_up_done = false; // a new date re-opens the reminder
  }
  if (payload.follow_up_done !== undefined) updates.follow_up_done = !!payload.follow_up_done;
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { error } = await service.from("communications").update(updates).eq("id", id);
  if (error) {
    console.error("[api/admin/communications] update failed:", error);
    return NextResponse.json({ ok: false, error: "Update failed." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id } = await params;
  const service = createServiceRoleClient();
  const { error } = await service.from("communications").delete().eq("id", id);
  if (error) {
    console.error("[api/admin/communications] delete failed:", error);
    return NextResponse.json({ ok: false, error: "Could not delete." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id } = await params;
  const payload = (await request.json().catch(() => null)) as { name?: string; subject?: string | null; body?: string } | null;
  if (!payload) return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (payload.name !== undefined) {
    const name = payload.name.trim().slice(0, 100);
    if (!name) return NextResponse.json({ ok: false, error: "Name can't be empty." }, { status: 400 });
    updates.name = name;
  }
  if (payload.subject !== undefined) updates.subject = payload.subject?.trim().slice(0, 200) || null;
  if (payload.body !== undefined) {
    const body = payload.body.trim().slice(0, 5000);
    if (!body) return NextResponse.json({ ok: false, error: "The message can't be empty." }, { status: 400 });
    updates.body = body;
  }
  if (Object.keys(updates).length === 0) return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });

  const service = createServiceRoleClient();
  const { error } = await service.from("message_templates").update(updates).eq("id", id);
  if (error) {
    console.error("[api/admin/message-templates] update failed:", error);
    return NextResponse.json({ ok: false, error: "Update failed." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id } = await params;
  const service = createServiceRoleClient();
  const { error } = await service.from("message_templates").delete().eq("id", id);
  if (error) {
    console.error("[api/admin/message-templates] delete failed:", error);
    return NextResponse.json({ ok: false, error: "Could not delete." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

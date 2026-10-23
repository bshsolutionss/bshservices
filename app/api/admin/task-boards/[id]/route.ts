import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
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
    if (!name) return NextResponse.json({ ok: false, error: "Give the board a name." }, { status: 400 });
    updates.name = name;
  }
  if (p.color !== undefined && /^#[0-9a-fA-F]{6}$/.test(String(p.color))) updates.color = p.color;
  if (p.description !== undefined) updates.description = cleanText(p.description, 500);
  if (p.clientId !== undefined) updates.client_id = isUuid(p.clientId) ? p.clientId : null;
  if (p.archived !== undefined) updates.archived = p.archived === true;
  if (Object.keys(updates).length === 0) return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });

  const { error } = await createServiceRoleClient().from("task_boards").update(updates).eq("id", id);
  return error ? NextResponse.json({ ok: false, error: "Could not save." }, { status: 500 }) : NextResponse.json({ ok: true });
}

/** Deleting a board deletes its tasks (they only exist on the board). */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  const { error } = await createServiceRoleClient().from("task_boards").delete().eq("id", id);
  return error ? NextResponse.json({ ok: false, error: "Could not delete the board." }, { status: 500 }) : NextResponse.json({ ok: true });
}

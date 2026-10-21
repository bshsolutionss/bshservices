import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { invalidateRoleCache, listRoleRows } from "@/lib/admin/roles";
import { ROLES, type Role } from "@/lib/permissions";

/** True if applying `change` would leave no active admin - which would lock everyone out of Settings. */
async function wouldRemoveLastAdmin(id: string, change: { role?: Role; active?: boolean; remove?: boolean }) {
  const rows = await listRoleRows();
  const remaining = rows.filter((r) => {
    if (r.id !== id) return r.role === "admin" && r.active;
    if (change.remove) return false;
    return (change.role ?? r.role) === "admin" && (change.active ?? r.active);
  });
  return remaining.length === 0;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id } = await params;
  const payload = (await request.json().catch(() => null)) as {
    role?: Role;
    employee_id?: string | null;
    active?: boolean;
  } | null;
  if (!payload) return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (payload.role !== undefined) {
    if (!ROLES.includes(payload.role)) return NextResponse.json({ ok: false, error: "Invalid role." }, { status: 400 });
    updates.role = payload.role;
    if (payload.role !== "employee") updates.employee_id = null;
  }
  if (payload.employee_id !== undefined && payload.role !== "admin" && payload.role !== "manager") {
    updates.employee_id = payload.employee_id || null;
  }
  if (payload.active !== undefined) updates.active = !!payload.active;
  if (Object.keys(updates).length === 0) return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });

  if (await wouldRemoveLastAdmin(id, { role: payload.role, active: payload.active })) {
    return NextResponse.json({ ok: false, error: "There must always be at least one active admin." }, { status: 409 });
  }

  const service = createServiceRoleClient();
  const { error } = await service.from("admin_roles").update(updates).eq("id", id);
  invalidateRoleCache();
  if (error) {
    console.error("[api/admin/users] update failed:", error);
    return NextResponse.json({ ok: false, error: "Update failed." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

/** Removes the role (the person can no longer open the panel). Their sign-in itself is not deleted. */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id } = await params;
  if (await wouldRemoveLastAdmin(id, { remove: true })) {
    return NextResponse.json({ ok: false, error: "There must always be at least one active admin." }, { status: 409 });
  }
  const service = createServiceRoleClient();
  const { error } = await service.from("admin_roles").delete().eq("id", id);
  invalidateRoleCache();
  if (error) return NextResponse.json({ ok: false, error: "Could not remove the user." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

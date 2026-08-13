import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { EMPLOYEE_STATUSES, type EmployeeStatus } from "@/lib/employees";

interface UpdatePayload {
  name?: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  department?: string | null;
  status?: EmployeeStatus;
  hire_date?: string | null;
  notes?: string | null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id } = await params;

  let payload: UpdatePayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  if (payload.status !== undefined && !EMPLOYEE_STATUSES.includes(payload.status)) {
    return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (payload.name !== undefined) updates.name = String(payload.name).slice(0, 200);
  if (payload.email !== undefined) updates.email = payload.email || null;
  if (payload.phone !== undefined) updates.phone = payload.phone || null;
  if (payload.role !== undefined) updates.role = payload.role || null;
  if (payload.department !== undefined) updates.department = payload.department || null;
  if (payload.status !== undefined) updates.status = payload.status;
  if (payload.hire_date !== undefined) updates.hire_date = payload.hire_date || null;
  if (payload.notes !== undefined) updates.notes = payload.notes || null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { error } = await service.from("employees").update(updates).eq("id", id);

  if (error) {
    console.error("[api/admin/employees] update failed:", error);
    return NextResponse.json({ ok: false, error: "Update failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id } = await params;
  const service = createServiceRoleClient();

  // Employees have no FK dependents (tasks.assignee_name is a free-text
  // snapshot, not a reference) — safe to delete unconditionally.
  const { error } = await service.from("employees").delete().eq("id", id);

  if (error) {
    console.error("[api/admin/employees] delete failed:", error);
    return NextResponse.json({ ok: false, error: "Could not delete employee." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

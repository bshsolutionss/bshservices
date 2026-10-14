import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  EMPLOYEE_STATUSES,
  EMPLOYMENT_TYPES,
  PAY_BASES,
  type EmployeeStatus,
  type EmploymentType,
  type PayBasis,
} from "@/lib/employees";
import { CURRENCIES, type Currency } from "@/lib/invoices";

interface UpdatePayload {
  name?: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  department?: string | null;
  status?: EmployeeStatus;
  hire_date?: string | null;
  notes?: string | null;
  employment_type?: EmploymentType;
  pay_basis?: PayBasis;
  pay_amount?: number | null;
  pay_currency?: Currency;
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

  if (payload.employment_type !== undefined && !EMPLOYMENT_TYPES.includes(payload.employment_type)) {
    return NextResponse.json({ ok: false, error: "Invalid employment type." }, { status: 400 });
  }
  if (payload.pay_basis !== undefined && !PAY_BASES.includes(payload.pay_basis)) {
    return NextResponse.json({ ok: false, error: "Invalid pay basis." }, { status: 400 });
  }
  if (payload.pay_currency !== undefined && !(CURRENCIES as string[]).includes(payload.pay_currency)) {
    return NextResponse.json({ ok: false, error: "Invalid currency." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (payload.employment_type !== undefined) updates.employment_type = payload.employment_type;
  if (payload.pay_basis !== undefined) updates.pay_basis = payload.pay_basis;
  if (payload.pay_currency !== undefined) updates.pay_currency = payload.pay_currency;
  if (payload.pay_amount !== undefined) {
    const amount = payload.pay_amount === null || (payload.pay_amount as unknown) === "" ? null : Number(payload.pay_amount);
    if (amount !== null && (!Number.isFinite(amount) || amount < 0)) {
      return NextResponse.json({ ok: false, error: "Pay can't be negative." }, { status: 400 });
    }
    updates.pay_amount = amount;
  }
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

  // tasks.assignee_id is ON DELETE SET NULL, so existing tasks keep their
  // assignee_name snapshot - safe to delete unconditionally.
  const { error } = await service.from("employees").delete().eq("id", id);

  if (error) {
    console.error("[api/admin/employees] delete failed:", error);
    return NextResponse.json({ ok: false, error: "Could not delete employee." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

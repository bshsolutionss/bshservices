import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { EXPENSE_TYPES, type ExpenseCategory, type ExpenseType } from "@/lib/expenses";
import { CURRENCIES, type Currency } from "@/lib/invoices";

interface UpdatePayload {
  category?: ExpenseCategory;
  amount?: number;
  currency?: Currency;
  expense_date?: string;
  vendor?: string | null;
  description?: string | null;
  expense_type?: ExpenseType;
  recurring_active?: boolean;
  project_id?: string | null;
}

export async function PATCH(
  request: Request,
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

  const updates: Record<string, unknown> = {};

  if (payload.category !== undefined) {
    if (!payload.category?.trim() || payload.category.length > 80) {
      return NextResponse.json({ ok: false, error: "Invalid category." }, { status: 400 });
    }
    updates.category = payload.category.trim();
  }
  if (payload.amount !== undefined) {
    if (!Number.isFinite(Number(payload.amount)) || Number(payload.amount) <= 0) {
      return NextResponse.json({ ok: false, error: "Amount must be a positive number." }, { status: 400 });
    }
    updates.amount = Number(payload.amount);
  }
  if (payload.currency !== undefined) {
    if (!CURRENCIES.includes(payload.currency)) {
      return NextResponse.json({ ok: false, error: "Invalid currency." }, { status: 400 });
    }
    updates.currency = payload.currency;
  }
  if (payload.expense_date !== undefined) {
    if (!payload.expense_date) {
      return NextResponse.json({ ok: false, error: "Expense date is required." }, { status: 400 });
    }
    updates.expense_date = payload.expense_date;
  }
  if (payload.vendor !== undefined) updates.vendor = payload.vendor?.trim() || null;
  if (payload.description !== undefined) updates.description = payload.description?.trim() || null;

  if (payload.expense_type !== undefined) {
    if (!EXPENSE_TYPES.includes(payload.expense_type)) {
      return NextResponse.json({ ok: false, error: "Invalid expense type." }, { status: 400 });
    }
    updates.expense_type = payload.expense_type;
  }
  if (payload.recurring_active !== undefined) updates.recurring_active = Boolean(payload.recurring_active);
  if (payload.project_id !== undefined) updates.project_id = payload.project_id || null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { error } = await service.from("expenses").update(updates).eq("id", id);

  if (error) {
    console.error("[api/admin/expenses] update failed:", error);
    return NextResponse.json({ ok: false, error: "Update failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id } = await params;
  const service = createServiceRoleClient();
  const { error } = await service.from("expenses").delete().eq("id", id);

  if (error) {
    console.error("[api/admin/expenses] delete failed:", error);
    return NextResponse.json({ ok: false, error: "Could not remove expense." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

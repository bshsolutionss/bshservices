import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { EXPENSE_RECURRENCES, EXPENSE_TYPES, type ExpenseCategory, type ExpenseRecurrence, type ExpenseType } from "@/lib/expenses";
import { CURRENCIES, type Currency } from "@/lib/invoices";

interface CreatePayload {
  category: ExpenseCategory;
  amount: number;
  currency?: Currency;
  expense_date?: string;
  vendor?: string;
  description?: string;
  expense_type?: ExpenseType;
  project_id?: string | null;
  employee_id?: string | null;
  /** For an auto (monthly-type) expense: how often it repeats. */
  recurrence?: ExpenseRecurrence;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  let payload: CreatePayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  if (!payload.category?.trim() || payload.category.length > 80) {
    return NextResponse.json({ ok: false, error: "A valid category is required." }, { status: 400 });
  }
  if (!payload.amount || payload.amount <= 0) {
    return NextResponse.json({ ok: false, error: "A positive amount is required." }, { status: 400 });
  }
  if (payload.currency && !CURRENCIES.includes(payload.currency)) {
    return NextResponse.json({ ok: false, error: "Invalid currency." }, { status: 400 });
  }

  if (payload.expense_type && !EXPENSE_TYPES.includes(payload.expense_type)) {
    return NextResponse.json({ ok: false, error: "Invalid expense type." }, { status: 400 });
  }

  if (payload.recurrence && !EXPENSE_RECURRENCES.includes(payload.recurrence)) {
    return NextResponse.json({ ok: false, error: "Invalid repeat interval." }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { data, error } = await service
    .from("expenses")
    .insert({
      category: payload.category.trim(),
      amount: payload.amount,
      // PKR is the business's standard currency — same default as projects and invoices.
      currency: payload.currency || "PKR",
      expense_date: payload.expense_date || new Date().toISOString().slice(0, 10),
      vendor: payload.vendor?.trim().slice(0, 200) || null,
      description: payload.description?.trim().slice(0, 1000) || null,
      expense_type: payload.expense_type || "one_time",
      project_id: payload.project_id || null,
      employee_id: payload.employee_id || null,
      recurrence: payload.recurrence || "monthly",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[api/admin/expenses] insert failed:", error);
    return NextResponse.json({ ok: false, error: "Could not save expense." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}

import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/lib/expenses";
import { CURRENCIES, type Currency } from "@/lib/invoices";

interface CreatePayload {
  category: ExpenseCategory;
  amount: number;
  currency?: Currency;
  expense_date?: string;
  vendor?: string;
  description?: string;
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

  if (!payload.category || !EXPENSE_CATEGORIES.includes(payload.category)) {
    return NextResponse.json({ ok: false, error: "A valid category is required." }, { status: 400 });
  }
  if (!payload.amount || payload.amount <= 0) {
    return NextResponse.json({ ok: false, error: "A positive amount is required." }, { status: 400 });
  }
  if (payload.currency && !CURRENCIES.includes(payload.currency)) {
    return NextResponse.json({ ok: false, error: "Invalid currency." }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { data, error } = await service
    .from("expenses")
    .insert({
      category: payload.category,
      amount: payload.amount,
      currency: payload.currency || "USD",
      expense_date: payload.expense_date || new Date().toISOString().slice(0, 10),
      vendor: payload.vendor?.trim().slice(0, 200) || null,
      description: payload.description?.trim().slice(0, 1000) || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[api/admin/expenses] insert failed:", error);
    return NextResponse.json({ ok: false, error: "Could not save expense." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}

import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { EMPLOYMENT_TYPES, PAY_BASES, type EmploymentType, type PayBasis } from "@/lib/employees";
import { CURRENCIES, type Currency } from "@/lib/invoices";

interface CreatePayload {
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  hire_date?: string;
  notes?: string;
  employment_type?: EmploymentType;
  pay_basis?: PayBasis;
  pay_amount?: number | null;
  pay_currency?: Currency;
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

  if (!payload.name?.trim()) {
    return NextResponse.json({ ok: false, error: "Name is required." }, { status: 400 });
  }

  if (payload.employment_type && !EMPLOYMENT_TYPES.includes(payload.employment_type)) {
    return NextResponse.json({ ok: false, error: "Invalid employment type." }, { status: 400 });
  }
  if (payload.pay_basis && !PAY_BASES.includes(payload.pay_basis)) {
    return NextResponse.json({ ok: false, error: "Invalid pay basis." }, { status: 400 });
  }
  if (payload.pay_currency && !(CURRENCIES as string[]).includes(payload.pay_currency)) {
    return NextResponse.json({ ok: false, error: "Invalid currency." }, { status: 400 });
  }
  if (payload.pay_amount != null && (!Number.isFinite(Number(payload.pay_amount)) || Number(payload.pay_amount) < 0)) {
    return NextResponse.json({ ok: false, error: "Pay can't be negative." }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { data, error } = await service
    .from("employees")
    .insert({
      employment_type: payload.employment_type || "job",
      pay_basis: payload.pay_basis || "monthly",
      pay_amount: payload.pay_amount != null && payload.pay_amount !== ("" as unknown) ? Number(payload.pay_amount) : null,
      pay_currency: payload.pay_currency || "PKR",
      notes: payload.notes?.trim().slice(0, 5000) || null,
      name: payload.name.trim(),
      email: payload.email?.trim() || null,
      phone: payload.phone?.trim() || null,
      role: payload.role?.trim() || null,
      department: payload.department?.trim() || null,
      hire_date: payload.hire_date || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[api/admin/employees] insert failed:", error);
    return NextResponse.json({ ok: false, error: "Could not add employee." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}

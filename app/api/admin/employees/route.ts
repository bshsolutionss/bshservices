import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

interface CreatePayload {
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  hire_date?: string;
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

  const service = createServiceRoleClient();
  const { data, error } = await service
    .from("employees")
    .insert({
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

import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

interface CreatePayload {
  company_name: string;
  contact_email: string;
  contact_name?: string;
  contact_phone?: string;
  industry?: string;
  account_manager?: string;
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

  if (!payload.company_name?.trim() || !payload.contact_email?.trim()) {
    return NextResponse.json(
      { ok: false, error: "Company name and contact email are required." },
      { status: 400 }
    );
  }

  const service = createServiceRoleClient();
  const { data, error } = await service
    .from("clients")
    .insert({
      company_name: payload.company_name.trim(),
      contact_email: payload.contact_email.trim(),
      contact_name: payload.contact_name?.trim() || null,
      contact_phone: payload.contact_phone?.trim() || null,
      industry: payload.industry?.trim() || null,
      account_manager: payload.account_manager?.trim() || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[api/admin/clients] insert failed:", error);
    return NextResponse.json({ ok: false, error: "Could not create client." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}

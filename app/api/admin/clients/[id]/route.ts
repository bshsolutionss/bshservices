import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

interface UpdatePayload {
  company_name?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  industry?: string;
  account_manager?: string;
  notes?: string;
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

  const updates: Record<string, unknown> = {};
  const stringFields: (keyof UpdatePayload)[] = [
    "company_name",
    "contact_name",
    "contact_email",
    "contact_phone",
    "industry",
    "account_manager",
    "notes",
  ];
  for (const field of stringFields) {
    if (payload[field] !== undefined) {
      updates[field] = String(payload[field]).slice(0, 2000) || null;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { error } = await service.from("clients").update(updates).eq("id", id);

  if (error) {
    console.error("[api/admin/clients] update failed:", error);
    return NextResponse.json({ ok: false, error: "Update failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

const EDITABLE_STATUSES = ["draft", "sent"] as const;

interface UpdatePayload {
  status?: (typeof EDITABLE_STATUSES)[number];
}

/** Currently only supports draft→sent — payment recording (which also
 * moves status to paid/partially_paid) goes through the payments route. */
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

  if (!payload.status || !EDITABLE_STATUSES.includes(payload.status)) {
    return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { error } = await service.from("invoices").update({ status: payload.status }).eq("id", id);

  if (error) {
    console.error("[api/admin/invoices] update failed:", error);
    return NextResponse.json({ ok: false, error: "Update failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

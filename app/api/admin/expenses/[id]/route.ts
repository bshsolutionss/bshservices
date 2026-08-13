import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

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

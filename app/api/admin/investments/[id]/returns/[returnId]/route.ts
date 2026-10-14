import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; returnId: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id, returnId } = await params;
  const service = createServiceRoleClient();
  const { error } = await service.from("investment_returns").delete().eq("id", returnId).eq("investment_id", id);
  if (error) {
    console.error("[api/admin/investments/returns] delete failed:", error);
    return NextResponse.json({ ok: false, error: "Could not delete the return." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; entryId: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id, entryId } = await params;
  const service = createServiceRoleClient();
  const { error } = await service.from("personal_project_entries").delete().eq("id", entryId).eq("project_id", id);
  if (error) {
    console.error("[api/admin/personal-projects/entries] delete failed:", error);
    return NextResponse.json({ ok: false, error: "Could not delete the entry." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

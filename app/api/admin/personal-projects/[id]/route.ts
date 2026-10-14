import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { parsePersonalProject } from "@/lib/admin/personal-project-parse";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id } = await params;
  const payload = await request.json().catch(() => null);
  if (!payload) return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });

  const parsed = parsePersonalProject(payload, true);
  if ("error" in parsed) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  if (Object.keys(parsed.values).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { error } = await service.from("personal_projects").update(parsed.values).eq("id", id);
  if (error) {
    console.error("[api/admin/personal-projects] update failed:", error);
    return NextResponse.json({ ok: false, error: "Update failed." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id } = await params;
  const service = createServiceRoleClient();
  const { error } = await service.from("personal_projects").delete().eq("id", id);
  if (error) {
    console.error("[api/admin/personal-projects] delete failed:", error);
    return NextResponse.json({ ok: false, error: "Could not delete the project." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

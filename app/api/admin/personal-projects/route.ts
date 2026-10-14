import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { parsePersonalProject, type PersonalProjectPayload } from "@/lib/admin/personal-project-parse";

export async function POST(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const payload = (await request.json().catch(() => null)) as PersonalProjectPayload | null;
  if (!payload) return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });

  const parsed = parsePersonalProject(payload, false);
  if ("error" in parsed) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });

  const service = createServiceRoleClient();
  const { data, error } = await service.from("personal_projects").insert(parsed.values).select("id").single();
  if (error || !data) {
    console.error("[api/admin/personal-projects] insert failed:", error);
    return NextResponse.json(
      { ok: false, error: "Could not save. Run supabase/migrations/0013_modules_goals_settings.sql first." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true, id: data.id });
}

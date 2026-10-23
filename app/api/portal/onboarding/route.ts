import { NextResponse, type NextRequest } from "next/server";
import { requirePortalUser } from "@/lib/portal/session";
import { createServiceRoleClient } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  const auth = await requirePortalUser();
  if (auth.unauthorized) return auth.unauthorized;

  const payload = (await request.json().catch(() => null)) as { checked?: unknown; done?: unknown } | null;
  const checked = Array.isArray(payload?.checked) ? payload.checked.filter((c): c is string => typeof c === "string").slice(0, 50) : [];
  const { error } = await createServiceRoleClient()
    .from("client_users")
    .update({ onboarding: { checked, done: payload?.done === true } })
    .eq("id", auth.session.id);
  if (error) return NextResponse.json({ ok: false, error: "Could not save." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

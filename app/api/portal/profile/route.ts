import { NextResponse, type NextRequest } from "next/server";
import { requirePortalUser } from "@/lib/portal/session";
import { createServiceRoleClient } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  const auth = await requirePortalUser();
  if (auth.unauthorized) return auth.unauthorized;

  const payload = (await request.json().catch(() => null)) as { name?: string } | null;
  const name = (payload?.name ?? "").trim().slice(0, 120);
  if (!name) return NextResponse.json({ ok: false, error: "Enter your name." }, { status: 400 });

  const { error } = await createServiceRoleClient().from("client_users").update({ name }).eq("id", auth.session.id);
  if (error) return NextResponse.json({ ok: false, error: "Could not save." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

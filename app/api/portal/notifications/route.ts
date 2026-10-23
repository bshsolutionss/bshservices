import { NextResponse } from "next/server";
import { requirePortalUser } from "@/lib/portal/session";
import { createServiceRoleClient } from "@/lib/supabase/service";

export async function GET() {
  const auth = await requirePortalUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { data } = await createServiceRoleClient()
    .from("portal_notifications")
    .select("id, title, body, href, read_at, created_at")
    .eq("client_id", auth.session.clientId)
    .order("created_at", { ascending: false })
    .limit(20);
  return NextResponse.json({ ok: true, notifications: data ?? [] });
}

/** Mark everything read. */
export async function POST() {
  const auth = await requirePortalUser();
  if (auth.unauthorized) return auth.unauthorized;
  await createServiceRoleClient()
    .from("portal_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("client_id", auth.session.clientId)
    .is("read_at", null);
  return NextResponse.json({ ok: true });
}

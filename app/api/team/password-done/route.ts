import { NextResponse } from "next/server";
import { getTeamSession } from "@/lib/team/session";
import { createServiceRoleClient } from "@/lib/supabase/service";

/** Clears the "must set a new password" flag after the browser has changed it. */
export async function POST() {
  const session = await getTeamSession();
  if (!session) return NextResponse.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const { error } = await createServiceRoleClient().from("admin_roles").update({ must_change_password: false }).eq("id", session.roleId);
  return error ? NextResponse.json({ ok: false, error: "Could not save." }, { status: 500 }) : NextResponse.json({ ok: true });
}

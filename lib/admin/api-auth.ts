import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

type AdminAuthResult = { user: User; unauthorized?: undefined } | { user?: undefined; unauthorized: NextResponse };

/**
 * Independent auth check for admin API routes — proxy.ts already guards the
 * /admin *pages*, but its matcher excludes /api, so every mutation route
 * re-checks itself. Usage:
 *
 *   const auth = await requireAdminUser();
 *   if (auth.unauthorized) return auth.unauthorized;
 */
export async function requireAdminUser(): Promise<AdminAuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { unauthorized: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  }

  return { user };
}

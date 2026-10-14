import { NextResponse } from "next/server";
import { getAdminSession, type AdminSession } from "@/lib/admin/session";

type AdminAuthResult =
  | { user: AdminSession; unauthorized?: undefined }
  | { user?: undefined; unauthorized: NextResponse };

/**
 * Independent auth check for admin API routes — proxy.ts guards the /admin
 * *pages*, but its matcher excludes /api, so every mutation route re-checks
 * itself. Usage:
 *
 *   const auth = await requireAdminUser();
 *   if (auth.unauthorized) return auth.unauthorized;
 */
export async function requireAdminUser(): Promise<AdminAuthResult> {
  const user = await getAdminSession();
  if (!user) {
    return { unauthorized: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  }
  return { user };
}

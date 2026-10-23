import { cache } from "react";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { normalizeAccess, type TeamAccess } from "@/lib/team-access";

export interface TeamSession {
  authUserId: string;
  email: string;
  /** admin_roles.id */
  roleId: string;
  employeeId: string;
  name: string;
  jobTitle: string | null;
  access: TeamAccess;
  mustChangePassword: boolean;
}

/**
 * The signed-in team member (an `employee` role linked to a team profile), or
 * null. Read straight from the database on every request - never the 30s role
 * cache - so switching someone off, changing their access or clearing the
 * "set a new password" flag takes effect immediately.
 */
export const getTeamSession = cache(async (): Promise<TeamSession | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub;
  const email = typeof data?.claims?.email === "string" ? data.claims.email.toLowerCase() : null;
  if (!sub || !email) return null;

  const service = createServiceRoleClient();
  const { data: role } = await service
    .from("admin_roles")
    .select("id, email, role, employee_id, active, access, must_change_password")
    .eq("email", email)
    .maybeSingle();
  if (!role || !role.active || role.role !== "employee" || !role.employee_id) return null;

  const { data: employee } = await service.from("employees").select("name, role, status").eq("id", role.employee_id).maybeSingle();
  if (!employee || employee.status !== "active") return null;

  return {
    authUserId: sub,
    email,
    roleId: role.id,
    employeeId: role.employee_id,
    name: employee.name,
    jobTitle: employee.role,
    access: normalizeAccess(role.access),
    mustChangePassword: !!role.must_change_password,
  };
});

type TeamAuthResult = { session: TeamSession; unauthorized?: undefined } | { session?: undefined; unauthorized: NextResponse };

/** Auth check for /api/team routes. */
export async function requireTeamUser(): Promise<TeamAuthResult> {
  const session = await getTeamSession();
  if (!session) return { unauthorized: NextResponse.json({ ok: false, error: "Please sign in again." }, { status: 401 }) };
  if (session.mustChangePassword) {
    return { unauthorized: NextResponse.json({ ok: false, error: "Set your own password first." }, { status: 403 }) };
  }
  return { session };
}

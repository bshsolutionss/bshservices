import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { invalidateRoleCache } from "@/lib/admin/roles";
import { emailTeamLogin, findAuthUserId, temporaryPassword, TEAM_LOGIN_URL } from "@/lib/admin/team-login";
import { normalizeAccess } from "@/lib/team-access";
import { isUuid } from "@/lib/portal/admin-input";

const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

/** Edits a team member's sign-in: their access, switching it off/on, or issuing a new temporary password. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ employeeId: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  if (auth.user.role !== "admin") return fail("Only admins can change team access.", 403);
  const { employeeId } = await params;
  if (!isUuid(employeeId)) return fail("Not found.", 404);

  const p = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!p) return fail("Invalid request.");

  const service = createServiceRoleClient();
  const { data: role } = await service.from("admin_roles").select("id, email, role, auth_user_id").eq("employee_id", employeeId).eq("role", "employee").maybeSingle();
  if (!role) return fail("This team member doesn't have a login yet.", 404);

  if (p.action === "access") {
    const { error } = await service.from("admin_roles").update({ access: normalizeAccess(p.access) }).eq("id", role.id);
    invalidateRoleCache();
    return error ? fail("Could not save access.", 500) : NextResponse.json({ ok: true });
  }

  if (p.action === "active") {
    const { error } = await service.from("admin_roles").update({ active: p.active === true }).eq("id", role.id);
    invalidateRoleCache();
    return error ? fail("Could not update.", 500) : NextResponse.json({ ok: true });
  }

  if (p.action === "reset") {
    const authId = role.auth_user_id ?? (await findAuthUserId(service, role.email));
    if (!authId) return fail("Couldn't find their sign-in. Remove their access and add them again.", 404);
    const password = temporaryPassword();
    const { error } = await service.auth.admin.updateUserById(authId, { password });
    if (error) return fail(`Could not reset the password: ${error.message}`, 500);
    await service.from("admin_roles").update({ must_change_password: true, auth_user_id: authId }).eq("id", role.id);
    const { data: employee } = await service.from("employees").select("name").eq("id", employeeId).maybeSingle();
    const sent = await emailTeamLogin({ to: role.email, name: employee?.name ?? role.email, password, employeeId });
    return NextResponse.json({ ok: true, email: role.email, password, loginUrl: TEAM_LOGIN_URL, emailSent: sent.ok, emailError: sent.ok ? undefined : sent.error });
  }

  return fail("Unknown action.");
}

/** Removes their login access (the profile and history stay). */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ employeeId: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  if (auth.user.role !== "admin") return fail("Only admins can change team access.", 403);
  const { employeeId } = await params;
  if (!isUuid(employeeId)) return fail("Not found.", 404);
  const { error } = await createServiceRoleClient().from("admin_roles").delete().eq("employee_id", employeeId).eq("role", "employee");
  invalidateRoleCache();
  return error ? fail("Could not remove access.", 500) : NextResponse.json({ ok: true });
}

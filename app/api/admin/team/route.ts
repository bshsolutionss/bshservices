import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { invalidateRoleCache, listRoleRows } from "@/lib/admin/roles";
import { getCompanySettings } from "@/lib/admin/company-settings";
import { emailTeamLogin, temporaryPassword, TEAM_LOGIN_URL } from "@/lib/admin/team-login";
import { normalizeAccess } from "@/lib/team-access";
import { cleanText } from "@/lib/portal/admin-input";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

/** "bilal.adil@x.com" -> "Bilal Adil", used when no display name is given. */
function nameFromEmail(email: string): string {
  return email
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Adds a team member in one step: their profile, a sign-in with a temporary
 * password (they must replace it on first sign-in), and their access. The login
 * details are emailed and also returned once so the admin can pass them on.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  if (auth.user.role !== "admin") return fail("Only admins can add team members.", 403);

  const p = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const email = String(p?.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return fail("Enter a valid email address.");
  const salary = p?.monthlySalary === "" || p?.monthlySalary == null ? null : Number(p.monthlySalary);
  if (salary !== null && (!Number.isFinite(salary) || salary < 0)) return fail("Salary can't be negative.");

  const service = createServiceRoleClient();
  const existing = await listRoleRows();
  if (existing.some((r) => r.email.toLowerCase() === email)) return fail(`${email} already has access. Edit them from the Team page instead.`, 409);
  const { data: clientLogin } = await service.from("client_users").select("id").ilike("email", email.replace(/[%_]/g, "\\$&")).maybeSingle();
  if (clientLogin) return fail("That email belongs to a client portal login. Use a different email.", 409);

  const company = await getCompanySettings();
  const name = cleanText(p?.displayName, 120) ?? nameFromEmail(email);
  const password = temporaryPassword();

  // A fresh login only: silently taking over an existing account (a client's, or an admin's) would be a security hole.
  const { data: created, error: createError } = await service.auth.admin.createUser({ email, password, email_confirm: true });
  if (createError || !created.user) {
    const taken = /already|registered|exists/i.test(createError?.message ?? "");
    return fail(taken ? "That email already has an account here. Use a different email for the team member." : `Could not create the login: ${createError?.message}`, taken ? 409 : 500);
  }

  const { data: employee, error: employeeError } = await service
    .from("employees")
    .insert({
      name,
      email,
      role: cleanText(p?.jobTitle, 80),
      notes: cleanText(p?.notes, 5000),
      employment_type: "job",
      pay_basis: "monthly",
      pay_amount: salary,
      pay_currency: company.default_currency,
      status: "active",
    })
    .select("id")
    .single();
  if (employeeError || !employee) {
    await service.auth.admin.deleteUser(created.user.id);
    console.error("[api/admin/team] employee insert failed:", employeeError);
    return fail("Could not save the team member.", 500);
  }

  const rows: Record<string, unknown>[] = [
    { email, role: "employee", employee_id: employee.id, access: normalizeAccess(p?.access), must_change_password: true, auth_user_id: created.user.id },
  ];
  // Adding the first role switches roles on - keep the person doing it as an admin.
  if (existing.length === 0 && auth.user.email && auth.user.email.toLowerCase() !== email) {
    rows.unshift({ email: auth.user.email.toLowerCase(), role: "admin", employee_id: null });
  }
  const { error: roleError } = await service.from("admin_roles").insert(rows);
  invalidateRoleCache();
  if (roleError) {
    await service.from("employees").delete().eq("id", employee.id);
    await service.auth.admin.deleteUser(created.user.id);
    console.error("[api/admin/team] role insert failed:", roleError);
    return fail("Could not save access. Run supabase/migrations/0018_team_access.sql first.", 500);
  }

  const sent = await emailTeamLogin({ to: email, name, password, employeeId: employee.id });
  return NextResponse.json({
    ok: true,
    employeeId: employee.id,
    name,
    email,
    password,
    loginUrl: TEAM_LOGIN_URL,
    emailSent: sent.ok,
    emailError: sent.ok ? undefined : sent.error,
  });
}

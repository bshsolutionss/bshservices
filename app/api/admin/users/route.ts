import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { invalidateRoleCache, listRoleRows } from "@/lib/admin/roles";
import { ROLES, type Role } from "@/lib/permissions";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  return NextResponse.json({ ok: true, users: await listRoleRows() });
}

interface CreatePayload {
  email?: string;
  role?: Role;
  employee_id?: string | null;
  /** When set, also creates the sign-in (email + this password) so they can log in straight away. */
  password?: string;
}

/** Give someone a role - and, optionally, create their login in the same step. */
export async function POST(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const payload = (await request.json().catch(() => null)) as CreatePayload | null;
  const email = payload?.email?.trim().toLowerCase() ?? "";
  if (!payload || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  }
  if (!payload.role || !ROLES.includes(payload.role)) {
    return NextResponse.json({ ok: false, error: "Choose a role." }, { status: 400 });
  }
  if (payload.role === "employee" && !payload.employee_id) {
    return NextResponse.json(
      { ok: false, error: "Choose which team member this login belongs to, so they see their own tasks." },
      { status: 400 }
    );
  }
  if (payload.password !== undefined && payload.password !== "" && payload.password.length < 8) {
    return NextResponse.json({ ok: false, error: "Use a password of at least 8 characters." }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const existing = await listRoleRows();
  if (existing.some((r) => r.email.toLowerCase() === email)) {
    return NextResponse.json({ ok: false, error: `${email} already has a role - change it in the list below.` }, { status: 409 });
  }

  if (payload.password) {
    const { error } = await service.auth.admin.createUser({ email, password: payload.password, email_confirm: true });
    // "Already registered" is fine - they just get a role; their existing password stays.
    if (error && !/already|registered|exists/i.test(error.message)) {
      return NextResponse.json({ ok: false, error: `Could not create the login: ${error.message}` }, { status: 400 });
    }
  }

  const rows: Record<string, unknown>[] = [
    { email, role: payload.role, employee_id: payload.role === "employee" ? payload.employee_id : null },
  ];
  // First user ever added switches roles on - make sure the person doing it keeps their admin access.
  if (existing.length === 0 && auth.user.email && auth.user.email.toLowerCase() !== email) {
    rows.unshift({ email: auth.user.email.toLowerCase(), role: "admin", employee_id: null });
  }

  const { error } = await service.from("admin_roles").insert(rows);
  invalidateRoleCache();
  if (error) {
    console.error("[api/admin/users] insert failed:", error);
    return NextResponse.json(
      { ok: false, error: "Could not save. Run supabase/migrations/0014_roles.sql first." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}

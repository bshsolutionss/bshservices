import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { invalidatePortalEmailCache, listRoleRows } from "@/lib/admin/roles";
import { sendEmail } from "@/lib/email/send";
import { getCompanySettings } from "@/lib/admin/company-settings";
import { logActivity } from "@/lib/activity";
import { PORTAL_URL, portalEmailHtml } from "@/lib/portal/notify";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 12 url-safe characters - easy to paste, hard to guess. The client is told to change it. */
function tempPassword(): string {
  return randomBytes(9).toString("base64url");
}

interface Payload {
  action?: "invite" | "resend" | "disable" | "enable";
  email?: string;
  name?: string;
}

/** Gives a client portal access, re-sends their login, or switches it off/on. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { id: clientId } = await params;

  const payload = (await request.json().catch(() => null)) as Payload | null;
  const action = payload?.action;
  if (!action || !["invite", "resend", "disable", "enable"].includes(action)) {
    return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { data: client } = await service.from("clients").select("id, company_name, contact_name, contact_email").eq("id", clientId).maybeSingle();
  if (!client) return NextResponse.json({ ok: false, error: "Client not found." }, { status: 404 });

  const { data: existing } = await service.from("client_users").select("id, auth_user_id, email, name, active").eq("client_id", clientId).limit(1).maybeSingle();

  if (action === "disable" || action === "enable") {
    if (!existing) return NextResponse.json({ ok: false, error: "This client has no portal login yet." }, { status: 404 });
    await service.from("client_users").update({ active: action === "enable" }).eq("id", existing.id);
    invalidatePortalEmailCache();
    return NextResponse.json({ ok: true });
  }

  const company = await getCompanySettings();
  const password = tempPassword();
  let email: string;
  let name: string | null;

  if (action === "resend") {
    if (!existing) return NextResponse.json({ ok: false, error: "This client has no portal login yet." }, { status: 404 });
    const { error } = await service.auth.admin.updateUserById(existing.auth_user_id, { password });
    if (error) return NextResponse.json({ ok: false, error: `Could not reset the password: ${error.message}` }, { status: 500 });
    email = existing.email;
    name = existing.name;
  } else {
    if (existing) return NextResponse.json({ ok: false, error: "This client already has portal access. Use Resend invite instead." }, { status: 409 });
    email = (payload?.email ?? client.contact_email ?? "").trim().toLowerCase();
    name = (payload?.name ?? client.contact_name ?? "").trim() || null;
    if (!EMAIL_RE.test(email)) return NextResponse.json({ ok: false, error: "Enter a valid email address for the client." }, { status: 400 });

    // A client login must never be (or become) a staff login.
    const staff = await listRoleRows();
    if (staff.some((r) => r.email.toLowerCase() === email)) {
      return NextResponse.json({ ok: false, error: "That email belongs to a team member. Use the client's own email address." }, { status: 409 });
    }
    const { data: created, error } = await service.auth.admin.createUser({ email, password, email_confirm: true });
    if (error || !created.user) {
      const taken = /already|registered|exists/i.test(error?.message ?? "");
      return NextResponse.json(
        { ok: false, error: taken ? "That email already has an account. Use a different email for this client's portal." : `Could not create the login: ${error?.message}` },
        { status: taken ? 409 : 500 }
      );
    }
    const { error: rowError } = await service.from("client_users").insert({ client_id: clientId, auth_user_id: created.user.id, email, name });
    if (rowError) {
      await service.auth.admin.deleteUser(created.user.id);
      console.error("[api/admin/clients/portal] insert failed:", rowError);
      return NextResponse.json({ ok: false, error: "Could not save. Run supabase/migrations/0015_client_portal.sql first." }, { status: 500 });
    }
    invalidatePortalEmailCache();
    await logActivity({ entityType: "client", entityId: clientId, type: "portal_invited", description: `Portal access given to ${email}` });
  }

  const sent = await sendEmail({
    to: email,
    subject: `Your ${company.name} client portal`,
    kind: "portal_invite",
    entityType: "client",
    entityId: clientId,
    html: portalEmailHtml({
      heading: `Welcome${name ? `, ${name.split(" ")[0]}` : ""}`,
      body: `Your client portal is ready: follow your projects, invoices and messages in one place.\n\nSign in with:\nEmail: ${email}\nTemporary password: ${password}\n\nPlease change your password after signing in (avatar menu > Profile & password).`,
      buttonLabel: "Open the portal",
      buttonHref: `${PORTAL_URL}/login`,
    }),
  });

  // If email isn't connected the admin still needs a way to hand the login over - show it once.
  return NextResponse.json({ ok: true, emailSent: sent.ok, emailError: sent.ok ? undefined : sent.error, email, password: sent.ok ? undefined : password });
}

import { randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email/send";
import { getCompanySettings } from "@/lib/admin/company-settings";
import { portalEmailHtml } from "@/lib/portal/notify";
import { SITE_URL } from "@/lib/site";

export const TEAM_LOGIN_URL = `${SITE_URL}/team/login`;

/** 14 characters from an unambiguous alphabet (no 0/O, 1/l/I) so it survives being read out or retyped. */
export function temporaryPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(14);
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}

/** Supabase has no lookup-by-email in the admin API, so older rows (created before we stored the id) are found by scanning. */
export async function findAuthUserId(service: SupabaseClient, email: string): Promise<string | null> {
  const target = email.toLowerCase();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return null;
    const hit = data.users.find((u) => u.email?.toLowerCase() === target);
    if (hit) return hit.id;
    if (data.users.length < 200) break;
  }
  return null;
}

/** Emails the login details. Returns whether it was sent so the admin knows if they must hand them over themselves. */
export async function emailTeamLogin(opts: { to: string; name: string; password: string; employeeId: string }) {
  const company = await getCompanySettings();
  return sendEmail({
    to: opts.to,
    subject: `Your ${company.name} team login`,
    kind: "team_invite",
    entityType: "employee",
    entityId: opts.employeeId,
    html: portalEmailHtml({
      heading: `Welcome to ${company.name}, ${opts.name.split(" ")[0]}`,
      body: `Your team dashboard is ready. Sign in with:\n\nEmail: ${opts.to}\nTemporary password: ${opts.password}\n\nThe first time you sign in you'll be asked to choose your own password.`,
      buttonLabel: "Sign in",
      buttonHref: TEAM_LOGIN_URL,
    }),
  });
}

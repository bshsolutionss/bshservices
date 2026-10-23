import { createServiceRoleClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email/send";
import { getCompanySettings } from "@/lib/admin/company-settings";
import { notifyClient } from "@/lib/portal/session";
import { SITE_URL } from "@/lib/site";

export const PORTAL_URL = `${SITE_URL}/portal`;

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");

/** Shared email shell so every portal email looks the same. */
export function portalEmailHtml(opts: { heading: string; body: string; buttonLabel: string; buttonHref: string }): string {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1c1917">
<h2 style="margin:0 0 12px;font-size:20px">${escapeHtml(opts.heading)}</h2>
<p style="margin:0 0 20px;line-height:1.6;color:#44403c">${escapeHtml(opts.body)}</p>
<a href="${opts.buttonHref}" style="display:inline-block;background:#ea580c;color:#fff;text-decoration:none;padding:11px 22px;border-radius:999px;font-weight:600">${escapeHtml(opts.buttonLabel)}</a>
</div>`;
}

/**
 * Tells a client about something new: a bell entry in their portal plus an
 * email to every active login on the account. Best-effort - call it inside
 * `after()` so the admin's save never waits on it.
 */
export async function notifyClientEverywhere(input: {
  clientId: string;
  title: string;
  body: string;
  /** Portal path to open, e.g. "/portal/requests". */
  path: string;
  kind: string;
}): Promise<void> {
  try {
    await notifyClient(input.clientId, input.title, input.body, input.path);
    const service = createServiceRoleClient();
    const { data: users } = await service.from("client_users").select("email").eq("client_id", input.clientId).eq("active", true);
    const to = (users ?? []).map((u) => u.email as string);
    if (to.length === 0) return;
    const company = await getCompanySettings();
    await sendEmail({
      to,
      subject: `${input.title} - ${company.name}`,
      kind: input.kind,
      entityType: "client",
      entityId: input.clientId,
      html: portalEmailHtml({ heading: input.title, body: input.body, buttonLabel: "Open your portal", buttonHref: `${SITE_URL}${input.path}` }),
    });
  } catch (err) {
    console.error("[portal-notify] failed:", err);
  }
}

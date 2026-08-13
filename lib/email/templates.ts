import { formatBookingDateTime, type Lead } from "@/lib/leads";

const BRAND_BLUE = "#1A14A5";
const BRAND_DARK = "#231F20";
const BRAND_BG = "#F4F7FE";
const LOGO_URL = "https://bshsolutionss.com/android-chrome-192x192.png";
const SITE_URL = "https://bshsolutionss.com";

const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com/people/BSH-Solutions/61582682037084/" },
  { label: "Instagram", href: "https://www.instagram.com/bshsolutions_/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/bsh-solutionss/" },
];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** One data row, omitted entirely when the value is empty — keeps emails free of "N/A" clutter. */
function row(label: string, value: string | null | undefined): string {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:6px 0;font-size:13px;color:#6b6b6b;width:150px;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:6px 0;font-size:14px;color:${BRAND_DARK};vertical-align:top;">${escapeHtml(value)}</td>
    </tr>`;
}

/**
 * Shared table-based, inline-styled email shell. Deliberately no <style>
 * block (many clients strip it) and no backdrop-blur/gradients — this is
 * the email-safe equivalent of the site's brand look: solid header bar,
 * white card, brand-blue accents, text-pill social links.
 */
function wrapEmailLayout(opts: { preheader: string; bodyHtml: string }): string {
  const { preheader, bodyHtml } = opts;

  const socialLinks = SOCIAL_LINKS.map(
    (s) =>
      `<a href="${s.href}" style="display:inline-block;margin:0 4px;padding:8px 18px;background:${BRAND_BLUE};color:#ffffff;border-radius:9999px;text-decoration:none;font-size:12px;font-weight:600;">${s.label}</a>`
  ).join("");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>BSH Solutions</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND_BG};font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_BG};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:${BRAND_BLUE};padding:24px 32px;text-align:center;">
                <img src="${LOGO_URL}" width="48" height="48" alt="BSH Solutions" style="display:block;margin:0 auto 8px;border-radius:8px;" />
                <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.5px;">BSH Solutions</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="background:${BRAND_BG};padding:24px 32px;text-align:center;">
                <div style="margin-bottom:14px;">${socialLinks}</div>
                <p style="margin:0;font-size:12px;color:#8a8a8a;">
                  BSH Solutions — Business Smart Hub &middot; Karachi, Pakistan<br />
                  <a href="${SITE_URL}" style="color:${BRAND_BLUE};text-decoration:none;">bshsolutionss.com</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function leadDetailRows(lead: Lead): string {
  return [
    row("Phone", lead.phone),
    row("Business", lead.business),
    row("Best time to connect", lead.best_time),
    row("Service", lead.selected_service || lead.service_category),
    row("Business type", lead.business_type),
    row("Message", lead.message),
  ].join("");
}

const SOURCE_LABELS: Record<Lead["source"], string> = {
  contact_form: "Contact Form",
  service_form: "Service Form",
  consultation_booking: "Consultation Booking",
};

export function clientConfirmationEmail(lead: Lead): { subject: string; html: string } {
  const firstName = lead.name.split(" ")[0] || lead.name;

  const bodyHtml = `
    <h1 style="margin:0 0 12px;font-size:22px;color:${BRAND_DARK};">Thanks, ${escapeHtml(firstName)} — we've got your message 👋</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${BRAND_DARK};">
      A member of the BSH Solutions team will review your request and get back to you shortly.
      Here's a copy of what you sent us:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_BG};border-radius:12px;padding:16px 20px;margin-bottom:20px;">
      ${leadDetailRows(lead)}
    </table>
    <p style="margin:0;font-size:14px;line-height:1.6;color:${BRAND_DARK};">
      Need to add anything in the meantime? Just reply to this email — it goes straight to our team.
    </p>`;

  return {
    subject: "We've received your message — BSH Solutions",
    html: wrapEmailLayout({
      preheader: "Thanks for reaching out to BSH Solutions — we'll be in touch shortly.",
      bodyHtml,
    }),
  };
}

export function adminNotificationEmail(lead: Lead): { subject: string; html: string } {
  const bodyHtml = `
    <h1 style="margin:0 0 4px;font-size:22px;color:${BRAND_DARK};">New lead 🎯</h1>
    <p style="margin:0 0 20px;font-size:13px;color:#6b6b6b;">
      via ${escapeHtml(SOURCE_LABELS[lead.source] ?? lead.source)}${lead.page_path ? ` &middot; ${escapeHtml(lead.page_path)}` : ""}
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_BG};border-radius:12px;padding:16px 20px;margin-bottom:20px;">
      ${row("Name", lead.name)}
      ${row("Email", lead.email)}
      ${leadDetailRows(lead)}
    </table>
    <a href="${SITE_URL}/admin/leads/${lead.id}" style="display:inline-block;padding:12px 24px;background:${BRAND_BLUE};color:#ffffff;border-radius:9999px;text-decoration:none;font-size:14px;font-weight:700;">
      View in Admin Panel
    </a>
    <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#6b6b6b;">
      Reply to this email to respond directly to ${escapeHtml(lead.name)}.
    </p>`;

  return {
    subject: `New lead: ${lead.name}${lead.selected_service ? ` — ${lead.selected_service}` : ""}`,
    html: wrapEmailLayout({
      preheader: `New lead from ${lead.name} (${lead.email})`,
      bodyHtml,
    }),
  };
}

export function bookingClientConfirmationEmail(lead: Lead): { subject: string; html: string } {
  const firstName = lead.name.split(" ")[0] || lead.name;
  const when = formatBookingDateTime(lead);

  const bodyHtml = `
    <h1 style="margin:0 0 12px;font-size:22px;color:${BRAND_DARK};">You're booked, ${escapeHtml(firstName)}! 🎉</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${BRAND_DARK};">
      Your free consultation with BSH Solutions is confirmed. We're looking forward to it.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_BLUE};border-radius:12px;padding:20px 24px;margin-bottom:20px;">
      <tr>
        <td style="font-size:18px;font-weight:700;color:#ffffff;">${escapeHtml(when)}</td>
      </tr>
    </table>
    ${
      lead.message
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_BG};border-radius:12px;padding:16px 20px;margin-bottom:20px;">
            ${row("Your message", lead.message)}
            ${row("Phone", lead.phone)}
          </table>`
        : ""
    }
    <p style="margin:0;font-size:14px;line-height:1.6;color:${BRAND_DARK};">
      Need to change anything? Just reply to this email and we'll sort it out.
    </p>`;

  return {
    subject: `Consultation confirmed — ${when || "BSH Solutions"}`,
    html: wrapEmailLayout({
      preheader: `Your free consultation is confirmed for ${when}.`,
      bodyHtml,
    }),
  };
}

export function bookingAdminNotificationEmail(lead: Lead): { subject: string; html: string } {
  const when = formatBookingDateTime(lead);

  const bodyHtml = `
    <h1 style="margin:0 0 4px;font-size:22px;color:${BRAND_DARK};">New consultation booked 📅</h1>
    <p style="margin:0 0 20px;font-size:13px;color:#6b6b6b;">
      ${lead.page_path ? escapeHtml(lead.page_path) : "Book a Consultation"}
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_BLUE};border-radius:12px;padding:20px 24px;margin-bottom:20px;">
      <tr>
        <td style="font-size:18px;font-weight:700;color:#ffffff;">${escapeHtml(when)}</td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_BG};border-radius:12px;padding:16px 20px;margin-bottom:20px;">
      ${row("Name", lead.name)}
      ${row("Email", lead.email)}
      ${row("Phone", lead.phone)}
      ${row("Message", lead.message)}
    </table>
    <a href="${SITE_URL}/admin/leads/${lead.id}" style="display:inline-block;padding:12px 24px;background:${BRAND_BLUE};color:#ffffff;border-radius:9999px;text-decoration:none;font-size:14px;font-weight:700;">
      View in Admin Panel
    </a>
    <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#6b6b6b;">
      Reply to this email to respond directly to ${escapeHtml(lead.name)}.
    </p>`;

  return {
    subject: `New consultation: ${lead.name} — ${when}`,
    html: wrapEmailLayout({
      preheader: `${lead.name} booked a consultation for ${when}`,
      bodyHtml,
    }),
  };
}

const FOLLOW_UP_COPY: Record<1 | 2 | 3, { subject: string; heading: string; body: string }> = {
  1: {
    subject: "Still thinking it over? — BSH Solutions",
    heading: "Just checking in 👋",
    body: "You reached out to us recently and we wanted to make sure your message didn't get lost in the shuffle. Happy to answer any questions or jump on a quick call whenever suits you.",
  },
  2: {
    subject: "Following up on your request — BSH Solutions",
    heading: "Still here whenever you're ready",
    body: "We haven't connected yet, so we wanted to follow up one more time. If now isn't the right time, no worries at all — just let us know and we'll check back later.",
  },
  3: {
    subject: "One last note from BSH Solutions",
    heading: "Last check-in from us",
    body: "This is our final follow-up for now — we don't want to clutter your inbox. If you'd like to pick this back up at any point, just reply to this email and we'll be right here.",
  },
};

export function followUpEmail(lead: Lead, stage: 1 | 2 | 3): { subject: string; html: string } {
  const copy = FOLLOW_UP_COPY[stage];
  const firstName = lead.name.split(" ")[0] || lead.name;

  const bodyHtml = `
    <h1 style="margin:0 0 12px;font-size:22px;color:${BRAND_DARK};">${escapeHtml(copy.heading)}</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${BRAND_DARK};">
      Hi ${escapeHtml(firstName)}, ${copy.body}
    </p>
    <a href="${SITE_URL}/contact" style="display:inline-block;padding:12px 24px;background:${BRAND_BLUE};color:#ffffff;border-radius:9999px;text-decoration:none;font-size:14px;font-weight:700;">
      Get in Touch
    </a>`;

  return {
    subject: copy.subject,
    html: wrapEmailLayout({ preheader: copy.body, bodyHtml }),
  };
}

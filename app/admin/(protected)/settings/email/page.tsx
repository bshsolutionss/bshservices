import { resolveEmailConfig } from "@/lib/email/settings";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { PageHeader, SectionCard, Badge } from "@/components/admin/ui";
import EmailSettingsForm, { type EmailSettingsView } from "@/components/admin/settings/EmailSettingsForm";
import { formatDate } from "@/lib/invoices";

export const dynamic = "force-dynamic";

interface EmailLogRow {
  id: string;
  created_at: string;
  to_email: string;
  subject: string;
  kind: string;
  status: "sent" | "failed";
  error: string | null;
}

export default async function EmailSettingsPage() {
  const supabase = createServiceRoleClient();
  const [config, { data: logData }] = await Promise.all([
    resolveEmailConfig(),
    supabase
      .from("email_log")
      .select("id, created_at, to_email, subject, kind, status, error")
      .order("created_at", { ascending: false })
      .limit(15),
  ]);

  const { smtp_pass_enc, resend_key_enc, ...rest } = config.settings;
  const initial: EmailSettingsView = {
    ...rest,
    has_smtp_pass: !!smtp_pass_enc,
    has_resend_key: !!resend_key_enc,
    connected: config.transport !== "none",
    transport: config.transport,
  };
  const log = (logData ?? []) as EmailLogRow[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email"
        subtitle={
          <>
            Connect the mailbox the panel sends from. Task assignments and invoices go out automatically.
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <EmailSettingsForm initial={initial} />

        <SectionCard title="Recent emails" subtitle="Last 15 sent from the panel" className="h-fit">
          {log.length === 0 ? (
            <p className="text-sm text-[#231F20]/55">Nothing sent yet.</p>
          ) : (
            <ul className="divide-y divide-[#1A14A5]/5">
              {log.map((row) => (
                <li key={row.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-[#231F20]">{row.subject}</p>
                    <Badge
                      label={row.status === "sent" ? "Sent" : "Failed"}
                      colors={
                        row.status === "sent"
                          ? { bg: "#D1FAE5", text: "#065F46" }
                          : { bg: "#FEE2E2", text: "#991B1B" }
                      }
                    />
                  </div>
                  <p className="truncate text-xs text-[#231F20]/55">
                    {row.to_email} · {formatDate(row.created_at)}
                  </p>
                  {row.error && <p className="mt-1 text-xs text-red-600">{row.error}</p>}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

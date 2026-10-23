import { CheckCircle2, ClipboardList, ExternalLink } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getPortalSession } from "@/lib/portal/session";
import { getVisibleProjects } from "@/lib/portal/data";
import { dateTime } from "@/lib/portal/format";
import { EmptyState, PageHeader, SectionLabel, StatusPill, portalCard } from "@/components/portal/ui";
import ApprovalActions from "@/components/portal/ApprovalActions";
import ChangeRequestForm from "@/components/portal/ChangeRequestForm";

const REQUEST_STATUS = {
  open: { label: "Received", tone: "blue" },
  in_progress: { label: "In progress", tone: "amber" },
  done: { label: "Done", tone: "green" },
  declined: { label: "Declined", tone: "stone" },
} as const;

export default async function PortalRequestsPage() {
  const session = (await getPortalSession())!;
  const service = createServiceRoleClient();
  const [{ data: approvals }, { data: requests }, projects] = await Promise.all([
    service
      .from("approvals")
      .select("id, title, description, link_url, status, client_comment, created_at, responded_at")
      .eq("client_id", session.clientId)
      .order("created_at", { ascending: false }),
    service
      .from("change_requests")
      .select("id, title, details, status, created_at")
      .eq("client_id", session.clientId)
      .order("created_at", { ascending: false })
      .limit(20),
    getVisibleProjects(session.clientId),
  ]);

  const pending = (approvals ?? []).filter((a) => a.status === "pending");
  const answered = (approvals ?? []).filter((a) => a.status !== "pending");

  return (
    <div>
      <PageHeader icon={ClipboardList} title="Requests" subtitle="Approvals waiting on you, and changes you'd like made." />

      {pending.length === 0 ? (
        <EmptyState icon={CheckCircle2} title="Nothing needs your approval" description="When we share something for sign-off, it'll appear right here." />
      ) : (
        <div className="space-y-3">
          {pending.map((a) => (
            <div key={a.id} className={`${portalCard} p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-xs text-stone-400">Sent {dateTime(a.created_at)}</p>
                </div>
                <StatusPill label="Needs your approval" tone="orange" dot />
              </div>
              {a.description && <p className="mt-2 whitespace-pre-line text-sm text-stone-600">{a.description}</p>}
              {a.link_url && (
                <a href={a.link_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:underline">
                  Open to review <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <ApprovalActions id={a.id} />
            </div>
          ))}
        </div>
      )}

      <SectionLabel hint="Tell us what you'd like adjusted or added.">Request a change</SectionLabel>
      <ChangeRequestForm projects={projects.map((p) => ({ id: p.id, name: p.name }))} />

      {(requests ?? []).length > 0 && (
        <>
          <SectionLabel>Your requests</SectionLabel>
          <div className={`${portalCard} divide-y divide-stone-100 overflow-hidden`}>
            {(requests ?? []).map((r) => {
              const s = REQUEST_STATUS[r.status as keyof typeof REQUEST_STATUS] ?? REQUEST_STATUS.open;
              return (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <p className="font-medium">{r.title}</p>
                    <p className="text-xs text-stone-400">{dateTime(r.created_at)}</p>
                  </div>
                  <StatusPill label={s.label} tone={s.tone} />
                </div>
              );
            })}
          </div>
        </>
      )}

      {answered.length > 0 && (
        <>
          <SectionLabel>Past approvals</SectionLabel>
          <div className={`${portalCard} divide-y divide-stone-100 overflow-hidden`}>
            {answered.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="font-medium">{a.title}</p>
                  {a.client_comment && <p className="text-xs text-stone-500">&ldquo;{a.client_comment}&rdquo;</p>}
                </div>
                <StatusPill label={a.status === "approved" ? "Approved" : "Changes requested"} tone={a.status === "approved" ? "green" : "amber"} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

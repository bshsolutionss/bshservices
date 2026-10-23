import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, Box, FileText, LayoutGrid, Wallet } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getPortalSession } from "@/lib/portal/session";
import { projectProgress } from "@/lib/portal/data";
import { PORTAL_STAGE } from "@/lib/portal/status";
import { dateTime } from "@/lib/portal/format";
import { EmptyState, PageHeader, ProgressBar, SectionLabel, StatusPill, portalCard } from "@/components/portal/ui";
import { DocumentRows, InvoiceRows, type DocRow } from "@/components/portal/lists";
import ReviewForm from "@/components/portal/ReviewForm";
import { cn } from "@/lib/utils";
import type { Project, ProjectStage } from "@/lib/projects";
import type { InvoiceBalance } from "@/lib/invoices";

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "deliverables", label: "Deliverables", icon: Box },
  { key: "billing", label: "Billing", icon: Wallet },
  { key: "files", label: "Files", icon: FileText },
] as const;

export default async function PortalProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab = "overview" } = await searchParams;
  const session = (await getPortalSession())!;
  const service = createServiceRoleClient();

  const { data: project } = await service
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("client_id", session.clientId)
    .eq("portal_visible", true)
    .maybeSingle<Project>();
  if (!project) notFound();

  const stage = PORTAL_STAGE[project.stage as ProjectStage];
  const [{ data: tasks }, { data: updates }, { data: docs }, { data: invoices }, { data: review }] = await Promise.all([
    service.from("tasks").select("status").eq("project_id", id).eq("client_visible", true),
    tab === "overview"
      ? service.from("project_updates").select("id, title, body, created_at").eq("project_id", id).eq("internal", false).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as { id: string; title: string; body: string | null; created_at: string }[] }),
    tab === "deliverables" || tab === "files"
      ? service
          .from("documents")
          .select("id, title, category, file_name, size_bytes, created_at")
          .eq("client_id", session.clientId)
          .eq("project_id", id)
          .eq("shared", true)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as DocRow[] }),
    tab === "billing"
      ? service
          .from("invoice_balances")
          .select("*")
          .eq("client_id", session.clientId)
          .eq("project_id", id)
          .neq("status", "draft")
          .order("issue_date", { ascending: false })
      : Promise.resolve({ data: [] as InvoiceBalance[] }),
    service.from("reviews").select("rating, body").eq("client_id", session.clientId).eq("project_id", id).eq("kind", "project").maybeSingle(),
  ]);

  const progress = projectProgress(project.stage, tasks ?? [], stage.progress);
  const allDocs = (docs ?? []) as DocRow[];
  const shown = tab === "deliverables" ? allDocs.filter((d) => d.category === "deliverable") : allDocs;

  return (
    <div>
      <PageHeader title="" backHref="/portal/projects" backLabel="Projects" />
      <div className={`${portalCard} -mt-6 p-6`}>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
          <StatusPill label={stage.label} tone={stage.tone} dot />
        </div>
        {project.description && <p className="mt-2 text-sm text-stone-500">{project.description}</p>}
        <div className="mt-4 flex items-center gap-3">
          <ProgressBar value={progress} />
          <span className="text-xs font-medium text-stone-500">{progress}%</span>
        </div>
      </div>

      <nav className="mt-5 inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-stone-200 bg-white p-1">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/portal/projects/${id}?tab=${t.key}`}
            className={cn(
              "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium",
              tab === t.key ? "bg-orange-50 text-orange-600" : "text-stone-600 hover:bg-stone-50"
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === "overview" && (
        <>
          <SectionLabel>Progress</SectionLabel>
          {(updates ?? []).length === 0 ? (
            <EmptyState icon={Activity} title="No updates yet" description="We'll post what's happening on this project here as it moves along." />
          ) : (
            <div className={`${portalCard} divide-y divide-stone-100`}>
              {(updates ?? []).map((u) => (
                <div key={u.id} className="px-5 py-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-medium">{u.title}</p>
                    <p className="text-xs text-stone-400">{dateTime(u.created_at)}</p>
                  </div>
                  {u.body && <p className="mt-1 whitespace-pre-line text-sm text-stone-600">{u.body}</p>}
                </div>
              ))}
            </div>
          )}
          <SectionLabel>Rate your experience</SectionLabel>
          <ReviewForm projectId={id} defaultName={session.name} existing={review ? { rating: review.rating ?? 0, body: review.body ?? "" } : null} />
        </>
      )}

      {tab === "deliverables" && (
        <div className="mt-6">
          <DocumentRows rows={shown} empty={{ title: "No deliverables yet", description: "Finished work will be shared here for you to download." }} />
        </div>
      )}
      {tab === "billing" && (
        <div className="mt-6">
          <InvoiceRows rows={(invoices ?? []) as InvoiceBalance[]} />
        </div>
      )}
      {tab === "files" && (
        <div className="mt-6">
          <DocumentRows rows={shown} empty={{ title: "No files yet", description: "Files shared for this project will appear here." }} />
        </div>
      )}
    </div>
  );
}

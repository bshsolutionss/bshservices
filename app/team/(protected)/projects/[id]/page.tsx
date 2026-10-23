import { notFound } from "next/navigation";
import { Download, FileText } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getTeamSession } from "@/lib/team/session";
import { canSeeProject } from "@/lib/team/data";
import { PORTAL_STAGE } from "@/lib/portal/status";
import { dateTime, fileSize } from "@/lib/portal/format";
import { formatDate, formatMoney } from "@/lib/invoices";
import { TASK_STATUS_LABELS, type TaskStatus } from "@/lib/tasks";
import { EmptyState, PageHeader, SectionLabel, StatusPill, portalCard } from "@/components/portal/ui";
import { FileUploadForm, ProgressForm } from "@/components/team/TeamForms";
import type { Project, ProjectStage } from "@/lib/projects";

export default async function TeamProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = (await getTeamSession())!;
  if (!(await canSeeProject(session, id))) notFound();
  const service = createServiceRoleClient();

  const canFiles = session.access.files !== "none";
  const [{ data: project }, { data: myTasks }, { data: updates }, { data: files }, { data: members }] = await Promise.all([
    service.from("projects").select("*, clients(company_name)").eq("id", id).maybeSingle(),
    service.from("tasks").select("id, title, status, due_date").eq("project_id", id).eq("assignee_id", session.employeeId).order("due_date", { ascending: true, nullsFirst: false }),
    service.from("project_updates").select("id, title, body, internal, author_name, created_at").eq("project_id", id).order("created_at", { ascending: false }).limit(30),
    canFiles ? service.from("documents").select("id, title, file_name, size_bytes, shared, created_at").eq("project_id", id).order("created_at", { ascending: false }) : Promise.resolve({ data: [] }),
    service.from("project_members").select("employees(name, role)").eq("project_id", id),
  ]);
  if (!project) notFound();
  const p = project as Project & { clients: { company_name: string } | { company_name: string }[] | null };
  const client = Array.isArray(p.clients) ? p.clients[0] : p.clients;
  const stage = PORTAL_STAGE[p.stage as ProjectStage];
  const team = (members ?? []).map((m) => (Array.isArray(m.employees) ? m.employees[0] : m.employees) as { name: string; role: string | null } | null).filter(Boolean) as { name: string; role: string | null }[];
  const showMoney = session.access.financials === "visible";

  return (
    <div>
      <PageHeader title="" backHref="/team/projects" backLabel="My Projects" />
      <div className={`${portalCard} -mt-6 p-6`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{p.name}</h1>
            <p className="mt-1 text-sm text-stone-500">
              {client?.company_name}
              {p.due_date && ` · due ${formatDate(p.due_date)}`}
              {showMoney && p.budget != null && ` · ${formatMoney(Number(p.budget), p.currency)}`}
            </p>
          </div>
          <StatusPill label={stage.label} tone={stage.tone} dot />
        </div>
        {p.description && <p className="mt-3 whitespace-pre-line text-sm text-stone-600">{p.description}</p>}
        {team.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {team.map((m) => (
              <span key={m.name} className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">
                {m.name}
                {m.role && <span className="text-stone-400"> · {m.role}</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      <SectionLabel>My tasks on this project</SectionLabel>
      {(myTasks ?? []).length === 0 ? (
        <p className="text-sm text-stone-400">Nothing assigned to you here.</p>
      ) : (
        <div className={`${portalCard} divide-y divide-stone-100`}>
          {(myTasks ?? []).map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <span className="font-medium">{t.title}</span>
              <span className="text-xs text-stone-500">
                {TASK_STATUS_LABELS[t.status as TaskStatus]}
                {t.due_date && ` · due ${formatDate(t.due_date)}`}
              </span>
            </div>
          ))}
        </div>
      )}

      <SectionLabel>Progress</SectionLabel>
      {session.access.progress !== "none" && <ProgressForm projectId={id} internal={session.access.progress === "internal"} />}
      <div className="mt-3">
        {(updates ?? []).length === 0 ? (
          <EmptyState icon={FileText} title="No updates yet" description="Progress updates on this project will appear here." />
        ) : (
          <div className={`${portalCard} divide-y divide-stone-100`}>
            {(updates ?? []).map((u) => (
              <div key={u.id} className="px-5 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium">
                    {u.title} {u.internal && <StatusPill label="Internal" tone="amber" />}
                  </p>
                  <p className="text-xs text-stone-400">
                    {u.author_name ? `${u.author_name} · ` : ""}
                    {dateTime(u.created_at)}
                  </p>
                </div>
                {u.body && <p className="mt-1 whitespace-pre-line text-sm text-stone-600">{u.body}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {canFiles && (
        <>
          <SectionLabel>Files</SectionLabel>
          {(session.access.files === "upload" || session.access.files === "share") && <FileUploadForm projects={[{ id, name: p.name }]} fixedProjectId={id} canShare={session.access.files === "share"} />}
          <div className="mt-3">
            {(files ?? []).length === 0 ? (
              <p className="text-sm text-stone-400">No files on this project yet.</p>
            ) : (
              <div className={`${portalCard} divide-y divide-stone-100`}>
                {(files ?? []).map((f) => (
                  <a key={f.id} href={`/api/team/files/${f.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50">
                    <FileText className="h-4 w-4 text-orange-600" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{f.title}</span>
                    <span className="text-xs text-stone-400">{fileSize(f.size_bytes)}</span>
                    <StatusPill label={f.shared ? "Shared with client" : "Internal"} tone={f.shared ? "green" : "stone"} />
                    <Download className="h-4 w-4 text-stone-400" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

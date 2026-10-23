import { redirect } from "next/navigation";
import { Download, FolderOpen } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getTeamSession } from "@/lib/team/session";
import { getTeamProjects } from "@/lib/team/data";
import { fileSize } from "@/lib/portal/format";
import { formatDate } from "@/lib/invoices";
import { EmptyState, PageHeader, SectionLabel, StatusPill, portalCard } from "@/components/portal/ui";
import { FileUploadForm } from "@/components/team/TeamForms";

export default async function TeamFilesPage() {
  const session = (await getTeamSession())!;
  if (session.access.files === "none") redirect("/team");
  const projects = await getTeamProjects(session);
  const ids = projects.map((p) => p.id);
  const { data } = ids.length
    ? await createServiceRoleClient().from("documents").select("id, title, file_name, size_bytes, shared, created_at, project_id").in("project_id", ids).order("created_at", { ascending: false }).limit(200)
    : { data: [] };
  const name = new Map(projects.map((p) => [p.id, p.name]));
  const canUpload = session.access.files === "upload" || session.access.files === "share";

  return (
    <div>
      <PageHeader icon={FolderOpen} title="Files" subtitle="Uploads and deliverables on your projects." />
      {canUpload && projects.length > 0 && <FileUploadForm projects={projects.map((p) => ({ id: p.id, name: p.name }))} canShare={session.access.files === "share"} />}
      <SectionLabel>All files</SectionLabel>
      {(data ?? []).length === 0 ? (
        <EmptyState icon={FolderOpen} title="No files yet" description="Files on your projects will appear here." />
      ) : (
        <div className={`${portalCard} divide-y divide-stone-100 overflow-hidden`}>
          {(data ?? []).map((f) => (
            <a key={f.id} href={`/api/team/files/${f.id}`} className="flex items-center gap-3 px-5 py-4 hover:bg-stone-50">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{f.title}</p>
                <p className="truncate text-xs text-stone-500">
                  {name.get(f.project_id as string)} · {f.file_name}
                  {f.size_bytes ? ` · ${fileSize(f.size_bytes)}` : ""} · {formatDate(f.created_at)}
                </p>
              </div>
              <StatusPill label={f.shared ? "Shared with client" : "Internal"} tone={f.shared ? "green" : "stone"} />
              <Download className="h-4 w-4 text-stone-400" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

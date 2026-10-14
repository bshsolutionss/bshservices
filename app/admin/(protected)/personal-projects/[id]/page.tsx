import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  PERSONAL_PROJECT_STATUS_COLORS,
  PERSONAL_PROJECT_STATUS_LABELS,
  entryTotals,
  type PersonalProject,
  type PersonalProjectEntry,
} from "@/lib/personal-projects";
import { formatDate, formatMoney } from "@/lib/invoices";
import { Badge, PageHeader, SectionCard, StatCard } from "@/components/admin/ui";
import PersonalProjectFormModal from "@/components/admin/personal-projects/PersonalProjectFormModal";
import PersonalProjectEntries from "@/components/admin/personal-projects/PersonalProjectEntries";
import DeleteEntityButton from "@/components/admin/DeleteEntityButton";

export const dynamic = "force-dynamic";

export default async function AdminPersonalProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceRoleClient();

  const [{ data: project }, { data: entriesData }] = await Promise.all([
    supabase.from("personal_projects").select("*").eq("id", id).single<PersonalProject>(),
    supabase.from("personal_project_entries").select("*").eq("project_id", id).order("entry_date", { ascending: false }),
  ]);
  if (!project) notFound();

  const entries = (entriesData ?? []) as PersonalProjectEntry[];
  const t = entryTotals(entries);
  const c = project.currency;

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/admin/personal-projects"
        backLabel="Personal projects"
        title={
          <span className="flex flex-wrap items-center gap-3">
            {project.name}
            <Badge label={PERSONAL_PROJECT_STATUS_LABELS[project.status]} colors={PERSONAL_PROJECT_STATUS_COLORS[project.status]} />
          </span>
        }
        subtitle={
          <>
            {project.start_date && <>Started {formatDate(project.start_date)}</>}
            {project.target_date && <> · Target {formatDate(project.target_date)}</>}
            {project.url && (
              <>
                {" · "}
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-[#1A14A5] hover:underline">
                  Open <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </>
            )}
          </>
        }
        actions={<PersonalProjectFormModal project={project} />}
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Spent" value={formatMoney(t.cost, c)} iconBg="#E11D48" valueColor="#9F1239" />
        <StatCard label="Earned" value={formatMoney(t.revenue, c)} iconBg="#0D9488" valueColor="#0F766E" />
        <StatCard
          label="Net"
          value={formatMoney(t.profit, c)}
          iconBg={t.profit >= 0 ? "#0D9488" : "#dc2626"}
          valueColor={t.profit >= 0 ? "#0F766E" : "#B91C1C"}
          description={t.cost > 0 ? `${Math.round((t.profit / t.cost) * 100)}% return on spend` : undefined}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Money in & out">
            <PersonalProjectEntries projectId={project.id} currency={c} entries={entries} />
          </SectionCard>
        </div>
        <div className="space-y-6">
          {(project.description || project.notes) && (
            <SectionCard title="About">
              {project.description && <p className="whitespace-pre-wrap text-sm text-[#231F20]/75">{project.description}</p>}
              {project.notes && <p className="mt-3 whitespace-pre-wrap rounded-xl bg-[#F4F7FE] p-3 text-sm text-[#231F20]/70">{project.notes}</p>}
            </SectionCard>
          )}
          <DeleteEntityButton
            endpoint={`/api/admin/personal-projects/${project.id}`}
            redirectTo="/admin/personal-projects"
            label="Delete project"
            title="Delete this project?"
            message="The project and everything logged against it are removed. This cannot be undone. If you have just stopped working on it, set it to Paused or Abandoned instead."
          />
        </div>
      </div>
    </div>
  );
}

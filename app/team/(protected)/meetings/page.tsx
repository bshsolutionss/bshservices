import { redirect } from "next/navigation";
import { CalendarDays, ExternalLink, Video } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getTeamSession } from "@/lib/team/session";
import { getTeamProjects } from "@/lib/team/data";
import { dateTime } from "@/lib/portal/format";
import { EmptyState, PageHeader, SectionLabel, StatusPill, portalCard } from "@/components/portal/ui";
import { MeetingForm } from "@/components/team/TeamForms";

export default async function TeamMeetingsPage() {
  const session = (await getTeamSession())!;
  if (session.access.meetings === "none") redirect("/team");
  const projects = await getTeamProjects(session);
  const clientIds = [...new Set(projects.map((p) => p.client_id))];
  const { data } = clientIds.length
    ? await createServiceRoleClient().from("meetings").select("id, title, starts_at, duration_minutes, link_url, status, clients(company_name)").in("client_id", clientIds).order("starts_at", { ascending: false }).limit(60)
    : { data: [] };
  const meetings = (data ?? []) as unknown as { id: string; title: string; starts_at: string; duration_minutes: number; link_url: string | null; status: string; clients: { company_name: string } | { company_name: string }[] | null }[];
  const now = Date.now();
  const upcoming = meetings.filter((m) => m.status === "scheduled" && new Date(m.starts_at).getTime() >= now - 3_600_000).reverse();
  const past = meetings.filter((m) => !upcoming.includes(m));

  const row = (m: (typeof meetings)[number], isUpcoming: boolean) => {
    const client = Array.isArray(m.clients) ? m.clients[0] : m.clients;
    return (
      <div key={m.id} className={`${portalCard} flex flex-wrap items-center justify-between gap-3 p-4`}>
        <div>
          <p className="font-semibold">{m.title}</p>
          <p className="text-sm text-stone-500">
            {client?.company_name} · {dateTime(m.starts_at)} · {m.duration_minutes} min
          </p>
        </div>
        <div className="flex items-center gap-2">
          {m.status === "cancelled" ? <StatusPill label="Cancelled" tone="red" /> : isUpcoming ? <StatusPill label="Upcoming" tone="blue" dot /> : <StatusPill label="Past" tone="stone" />}
          {isUpcoming && m.link_url && (
            <a href={m.link_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600">
              <Video className="h-3.5 w-3.5" /> Join <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <PageHeader icon={CalendarDays} title="Meetings" subtitle="Calls with the clients of your projects." />
      {session.access.meetings === "create" && projects.length > 0 && <MeetingForm projects={projects.map((p) => ({ id: p.id, name: p.name }))} />}
      {meetings.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={CalendarDays} title="No meetings yet" description="Scheduled meetings will appear here." />
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <>
              <SectionLabel>Upcoming</SectionLabel>
              <div className="space-y-3">{upcoming.map((m) => row(m, true))}</div>
            </>
          )}
          {past.length > 0 && (
            <>
              <SectionLabel>Past</SectionLabel>
              <div className="space-y-3">{past.map((m) => row(m, false))}</div>
            </>
          )}
        </>
      )}
    </div>
  );
}

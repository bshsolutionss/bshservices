import { CalendarDays, ExternalLink, PlayCircle, Video } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getPortalSession } from "@/lib/portal/session";
import { dateTime } from "@/lib/portal/format";
import { EmptyState, PageHeader, SectionLabel, StatusPill, portalCard } from "@/components/portal/ui";

interface Meeting {
  id: string;
  title: string;
  starts_at: string;
  duration_minutes: number;
  link_url: string | null;
  agenda: string | null;
  notes: string | null;
  recording_url: string | null;
  status: string;
}

export default async function PortalMeetingsPage() {
  const session = (await getPortalSession())!;
  const { data } = await createServiceRoleClient()
    .from("meetings")
    .select("id, title, starts_at, duration_minutes, link_url, agenda, notes, recording_url, status")
    .eq("client_id", session.clientId)
    .order("starts_at", { ascending: false });
  const all = (data ?? []) as Meeting[];
  const now = Date.now();
  const upcoming = all.filter((m) => m.status === "scheduled" && new Date(m.starts_at).getTime() >= now - 3_600_000).reverse();
  const past = all.filter((m) => !upcoming.includes(m));

  const row = (m: Meeting, isUpcoming: boolean) => (
    <div key={m.id} className={`${portalCard} p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{m.title}</p>
          <p className="text-sm text-stone-500">
            {dateTime(m.starts_at)} · {m.duration_minutes} min
          </p>
        </div>
        {m.status === "cancelled" ? <StatusPill label="Cancelled" tone="red" /> : isUpcoming ? <StatusPill label="Upcoming" tone="blue" dot /> : <StatusPill label="Held" tone="green" />}
      </div>
      {m.agenda && <p className="mt-3 whitespace-pre-line text-sm text-stone-600">{m.agenda}</p>}
      {m.notes && (
        <div className="mt-3 rounded-2xl bg-stone-50 p-3 text-sm text-stone-600">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">Notes</p>
          <p className="whitespace-pre-line">{m.notes}</p>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {isUpcoming && m.link_url && (
          <a href={m.link_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
            <Video className="h-4 w-4" /> Join call <ExternalLink className="h-3 w-3" />
          </a>
        )}
        {m.recording_url && (
          <a href={m.recording_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
            <PlayCircle className="h-4 w-4" /> Recording
          </a>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader icon={CalendarDays} title="Meetings" subtitle="Upcoming calls, notes and recordings." />
      {all.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No meetings yet" description="Scheduled meetings and past notes will appear here." />
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

import { BellRing, MessagesSquare } from "lucide-react";
import { todayInPkt } from "@/lib/availability";
import { loadCommunicationData } from "@/lib/admin/communication-data";
import { PageHeader, SectionCard, StatCard } from "@/components/admin/ui";
import { ComposeEmailModal, LogCommunicationModal } from "@/components/admin/communication/CommunicationModals";
import CommunicationTable from "@/components/admin/communication/CommunicationTable";
import FollowUpList from "@/components/admin/communication/FollowUpList";

export const dynamic = "force-dynamic";

export default async function AdminCommunicationPage() {
  const { rows, clients, projects, templates } = await loadCommunicationData();
  const today = todayInPkt();
  const weekAhead = new Date(`${today}T00:00:00Z`);
  weekAhead.setUTCDate(weekAhead.getUTCDate() + 7);
  const weekAheadIso = weekAhead.toISOString().slice(0, 10);

  const followUps = rows
    .filter((r) => r.follow_up_on && !r.follow_up_done && r.follow_up_on <= weekAheadIso)
    .sort((a, b) => (a.follow_up_on! < b.follow_up_on! ? -1 : 1));
  const overdue = followUps.filter((r) => r.follow_up_on! < today).length;
  const thisWeek = rows.filter((r) => Date.now() - new Date(r.occurred_at).getTime() < 7 * 24 * 60 * 60 * 1000).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client communication"
        subtitle="Every call, chat, meeting and email with your clients - in one place, with follow-up reminders."
        actions={
          <>
            <ComposeEmailModal clients={clients} projects={projects} templates={templates} variant="outline" />
            <LogCommunicationModal clients={clients} projects={projects} />
          </>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Follow-ups due" value={followUps.length} icon={BellRing} iconBg="#f97316" valueColor="#92400E" description="Overdue or due within 7 days" />
        <StatCard label="Overdue" value={overdue} icon={BellRing} iconBg="#dc2626" valueColor={overdue ? "#B91C1C" : undefined} description="Past their date" />
        <StatCard label="This week" value={thisWeek} icon={MessagesSquare} iconBg="#1A14A5" description="Conversations logged" />
      </div>

      {followUps.length > 0 && (
        <SectionCard title="Follow-ups due" subtitle="People you promised to get back to">
          <FollowUpList
            today={today}
            items={followUps.map((r) => ({ ...r, clientName: r.clientName, clientPhone: r.clientPhone }))}
          />
        </SectionCard>
      )}

      <CommunicationTable rows={rows} />
    </div>
  );
}

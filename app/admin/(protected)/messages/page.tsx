import { createServiceRoleClient } from "@/lib/supabase/service";
import ChatView from "@/components/chat/ChatView";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const { data: clients } = await createServiceRoleClient().from("clients").select("id, company_name").order("company_name");

  return (
    <div className="space-y-4">
      <PageHeader title="Messages" subtitle="Chat with clients - they see these in their portal and get an email when you reply." />
      <ChatView
        side="admin"
        apiBase="/api/admin/messages"
        attachmentBase="/api/admin/messages"
        clients={(clients ?? []).map((cl) => ({ id: cl.id, name: cl.company_name }))}
        initialConversationId={c}
        className="h-[calc(100vh-14rem)] min-h-[480px]"
      />
    </div>
  );
}

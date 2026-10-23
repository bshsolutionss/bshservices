import ChatView from "@/components/chat/ChatView";

export const metadata = { title: "Messages" };

export default function PortalMessagesPage() {
  return (
    <div className="-mx-4 sm:-mx-8 lg:mx-0">
      <ChatView side="client" apiBase="/api/portal" attachmentBase="/api/portal/messages" className="h-[calc(100vh-7.5rem)] min-h-[480px] lg:rounded-3xl rounded-none" />
    </div>
  );
}

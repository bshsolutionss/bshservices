import { NextResponse } from "next/server";
import { requirePortalUser } from "@/lib/portal/session";
import { ensureMainConversation, listConversations } from "@/lib/portal/chat";
import { getCompanySettings } from "@/lib/admin/company-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requirePortalUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { session } = auth;

  let conversations = await listConversations("client", session.clientId);
  // First visit: open the main chat with the agency so there's always somewhere to write.
  if (conversations.length === 0) {
    const company = await getCompanySettings();
    await ensureMainConversation(session.clientId, company.name);
    conversations = await listConversations("client", session.clientId);
  }
  return NextResponse.json({ ok: true, conversations });
}

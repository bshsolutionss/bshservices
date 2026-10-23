import type { NextRequest } from "next/server";
import { requirePortalUser } from "@/lib/portal/session";
import { attachmentRedirect } from "@/lib/portal/chat";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePortalUser();
  if (auth.unauthorized) return auth.unauthorized;
  const { id } = await params;
  // Passing the client id makes attachmentRedirect refuse files from other clients' chats.
  return attachmentRedirect(id, auth.session.clientId);
}

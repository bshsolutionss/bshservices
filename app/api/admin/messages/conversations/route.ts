import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { ensureMainConversation, listConversations } from "@/lib/portal/chat";
import { getCompanySettings } from "@/lib/admin/company-settings";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;
  return NextResponse.json({ ok: true, conversations: await listConversations("admin") });
}

/** Opens (or finds) the main chat with a client so the team can write first. */
export async function POST(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const payload = (await request.json().catch(() => null)) as { clientId?: string } | null;
  if (!payload?.clientId) return NextResponse.json({ ok: false, error: "Choose a client." }, { status: 400 });
  const { data: client } = await createServiceRoleClient().from("clients").select("id").eq("id", payload.clientId).maybeSingle();
  if (!client) return NextResponse.json({ ok: false, error: "Client not found." }, { status: 404 });

  const company = await getCompanySettings();
  const id = await ensureMainConversation(client.id, company.name);
  return NextResponse.json({ ok: true, id });
}

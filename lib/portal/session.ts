import { cache } from "react";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

export interface PortalSession {
  /** client_users.id */
  id: string;
  authUserId: string;
  email: string;
  /** The person's own name, falling back to the client's contact name. */
  name: string;
  clientId: string;
  /** The client's company name - what the sidebar shows. */
  clientName: string;
  onboarding: { checked?: string[]; done?: boolean };
}

/**
 * The signed-in client login, or null (signed out, not a portal user, or switched off).
 *
 * This is the data-isolation boundary: every portal query is scoped with the
 * `clientId` returned here, never with an id taken from the request. The
 * database has RLS on with no policies, so nothing else can read these tables.
 */
export const getPortalSession = cache(async (): Promise<PortalSession | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub;
  if (!sub) return null;

  const service = createServiceRoleClient();
  const { data: row } = await service
    .from("client_users")
    .select("id, auth_user_id, email, name, client_id, active, onboarding, clients(company_name, contact_name)")
    .eq("auth_user_id", sub)
    .maybeSingle();
  if (!row || !row.active) return null;

  const client = (Array.isArray(row.clients) ? row.clients[0] : row.clients) as
    | { company_name: string; contact_name: string | null }
    | null;
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    email: row.email,
    name: row.name || client?.contact_name || client?.company_name || row.email,
    clientId: row.client_id,
    clientName: client?.company_name ?? "Your account",
    onboarding: (row.onboarding as PortalSession["onboarding"]) ?? {},
  };
});

type PortalAuthResult =
  | { session: PortalSession; unauthorized?: undefined }
  | { session?: undefined; unauthorized: NextResponse };

/** Auth check for /api/portal routes (the proxy matcher skips /api, so each route checks itself). */
export async function requirePortalUser(): Promise<PortalAuthResult> {
  const session = await getPortalSession();
  if (!session) {
    return { unauthorized: NextResponse.json({ ok: false, error: "Please sign in again." }, { status: 401 }) };
  }
  return { session };
}

/** Adds a bell notification for the client (best-effort - never fails the caller). */
export async function notifyClient(clientId: string, title: string, body?: string, href?: string) {
  try {
    await createServiceRoleClient()
      .from("portal_notifications")
      .insert({ client_id: clientId, title, body: body ?? null, href: href ?? null });
  } catch {
    // Best-effort.
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

interface SubscribePayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/** Registers a browser's push subscription so it receives sendAdminPush() notifications. */
export async function POST(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  let payload: SubscribePayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  if (!payload.endpoint || !payload.keys?.p256dh || !payload.keys?.auth) {
    return NextResponse.json({ ok: false, error: "Invalid push subscription." }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { error } = await service.from("push_subscriptions").upsert(
    {
      endpoint: payload.endpoint,
      p256dh: payload.keys.p256dh,
      auth: payload.keys.auth,
      user_agent: request.headers.get("user-agent")?.slice(0, 300) || null,
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    console.error("[api/admin/push/subscription] upsert failed:", error);
    return NextResponse.json({ ok: false, error: "Could not save subscription." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/** Removes a browser's push subscription (the "Disable Notifications" toggle). */
export async function DELETE(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  let payload: { endpoint?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  if (!payload.endpoint) {
    return NextResponse.json({ ok: false, error: "Endpoint is required." }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { error } = await service.from("push_subscriptions").delete().eq("endpoint", payload.endpoint);

  if (error) {
    console.error("[api/admin/push/subscription] delete failed:", error);
    return NextResponse.json({ ok: false, error: "Could not remove subscription." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

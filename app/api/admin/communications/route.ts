import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { COMM_CHANNELS, type CommChannel, type CommDirection } from "@/lib/communications";

interface CreatePayload {
  client_id: string;
  project_id?: string | null;
  channel: CommChannel;
  direction?: CommDirection;
  subject?: string;
  summary?: string;
  occurred_at?: string;
  follow_up_on?: string | null;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Log a call, WhatsApp chat, meeting or note against a client. */
export async function POST(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const payload = (await request.json().catch(() => null)) as CreatePayload | null;
  if (!payload) return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });

  if (!payload.client_id) return NextResponse.json({ ok: false, error: "Choose a client." }, { status: 400 });
  if (!COMM_CHANNELS.includes(payload.channel)) {
    return NextResponse.json({ ok: false, error: "Choose how you communicated." }, { status: 400 });
  }
  if (!payload.subject?.trim() && !payload.summary?.trim()) {
    return NextResponse.json({ ok: false, error: "Add a subject or a few notes about what was discussed." }, { status: 400 });
  }
  if (payload.follow_up_on && !DATE.test(payload.follow_up_on)) {
    return NextResponse.json({ ok: false, error: "Invalid follow-up date." }, { status: 400 });
  }
  const occurred = payload.occurred_at ? new Date(payload.occurred_at) : new Date();
  if (Number.isNaN(occurred.getTime())) return NextResponse.json({ ok: false, error: "Invalid date." }, { status: 400 });

  const service = createServiceRoleClient();
  const { data, error } = await service
    .from("communications")
    .insert({
      client_id: payload.client_id,
      project_id: payload.project_id || null,
      channel: payload.channel,
      direction: payload.direction === "inbound" ? "inbound" : "outbound",
      subject: payload.subject?.trim().slice(0, 200) || null,
      summary: payload.summary?.trim().slice(0, 5000) || null,
      occurred_at: occurred.toISOString(),
      follow_up_on: payload.follow_up_on || null,
    })
    .select("id")
    .single();
  if (error || !data) {
    console.error("[api/admin/communications] insert failed:", error);
    return NextResponse.json(
      { ok: false, error: "Could not save. Run supabase/migrations/0013_modules_goals_settings.sql first." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true, id: data.id });
}

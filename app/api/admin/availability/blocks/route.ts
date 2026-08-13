import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

interface CreateBlockPayload {
  block_date: string;
  start_time?: string;
  end_time?: string;
  reason?: string;
}

export async function GET() {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const service = createServiceRoleClient();
  const { data, error } = await service
    .from("availability_blocks")
    .select("*")
    .gte("block_date", new Date().toISOString().slice(0, 10))
    .order("block_date");

  if (error) {
    console.error("[api/admin/availability/blocks] fetch failed:", error);
    return NextResponse.json({ ok: false, error: "Could not load blocks.", blocks: [] }, { status: 500 });
  }

  return NextResponse.json({ ok: true, blocks: data ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  let payload: CreateBlockPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  if (!payload.block_date || !/^\d{4}-\d{2}-\d{2}$/.test(payload.block_date)) {
    return NextResponse.json({ ok: false, error: "A valid date is required." }, { status: 400 });
  }

  const hasPartialRange = Boolean(payload.start_time) !== Boolean(payload.end_time);
  if (hasPartialRange) {
    return NextResponse.json(
      { ok: false, error: "Provide both a start and end time, or leave both blank to block the whole day." },
      { status: 400 }
    );
  }

  const service = createServiceRoleClient();
  const { data, error } = await service
    .from("availability_blocks")
    .insert({
      block_date: payload.block_date,
      start_time: payload.start_time || null,
      end_time: payload.end_time || null,
      reason: payload.reason?.trim().slice(0, 300) || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[api/admin/availability/blocks] insert failed:", error);
    return NextResponse.json({ ok: false, error: "Could not add block." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}

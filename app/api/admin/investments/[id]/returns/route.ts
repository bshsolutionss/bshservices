import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

/** Record income received from an investment (dividend, rent, profit share, sale proceeds). */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id } = await params;
  const payload = (await request.json().catch(() => null)) as { amount?: number; received_on?: string; note?: string } | null;
  const amount = Number(payload?.amount);
  if (!payload || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, error: "Enter an amount greater than zero." }, { status: 400 });
  }
  if (payload.received_on && !/^\d{4}-\d{2}-\d{2}$/.test(payload.received_on)) {
    return NextResponse.json({ ok: false, error: "Invalid date." }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { error } = await service.from("investment_returns").insert({
    investment_id: id,
    amount,
    received_on: payload.received_on || new Date().toISOString().slice(0, 10),
    note: payload.note?.trim().slice(0, 500) || null,
  });
  if (error) {
    console.error("[api/admin/investments/returns] insert failed:", error);
    return NextResponse.json({ ok: false, error: "Could not record the return." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

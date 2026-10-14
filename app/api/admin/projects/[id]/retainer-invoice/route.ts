import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { createRetainerInvoice } from "@/lib/admin/recurring";
import { todayInPkt } from "@/lib/availability";
import type { Project } from "@/lib/projects";

/** Drafts the retainer invoice for a monthly project - this month by default, or `{ period: "YYYY-MM" }`. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { period?: string };
  const period = body.period || todayInPkt().slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
    return NextResponse.json({ ok: false, error: "Invalid billing period." }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { data: project } = await service.from("projects").select("*").eq("id", id).single<Project>();
  if (!project) return NextResponse.json({ ok: false, error: "Project not found." }, { status: 404 });
  if (project.billing_type !== "monthly") {
    return NextResponse.json({ ok: false, error: "Only monthly projects have retainer invoices." }, { status: 400 });
  }

  const result = await createRetainerInvoice(service, project, period);
  if (result.status === "error") return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true, ...result });
}

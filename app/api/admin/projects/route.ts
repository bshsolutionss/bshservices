import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { logActivity } from "@/lib/activity";
import { PROJECT_SERVICE_CATEGORIES, type ProjectServiceCategory } from "@/lib/projects";
import { CURRENCIES, type Currency } from "@/lib/invoices";

interface CreatePayload {
  name: string;
  client_id: string;
  budget?: number;
  currency?: Currency;
  start_date?: string;
  due_date?: string;
  service_category?: ProjectServiceCategory;
  description?: string;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  let payload: CreatePayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  if (!payload.name?.trim() || !payload.client_id) {
    return NextResponse.json({ ok: false, error: "Name and client are required." }, { status: 400 });
  }

  if (payload.service_category && !PROJECT_SERVICE_CATEGORIES.includes(payload.service_category)) {
    return NextResponse.json({ ok: false, error: "Invalid service category." }, { status: 400 });
  }

  if (payload.currency && !(CURRENCIES as string[]).includes(payload.currency)) {
    return NextResponse.json({ ok: false, error: "Invalid currency." }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { data, error } = await service
    .from("projects")
    .insert({
      name: payload.name.trim(),
      client_id: payload.client_id,
      budget: payload.budget ?? null,
      // PKR is the business's standard currency — see supabase/migrations/0009_currency.sql.
      currency: payload.currency || "PKR",
      start_date: payload.start_date || null,
      due_date: payload.due_date || null,
      service_category: payload.service_category || null,
      description: payload.description?.trim() || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[api/admin/projects] insert failed:", error);
    return NextResponse.json({ ok: false, error: "Could not create project." }, { status: 500 });
  }

  await logActivity({
    entityType: "project",
    entityId: data.id,
    type: "project_created",
    description: `Created manually: ${payload.name.trim()}`,
  });

  return NextResponse.json({ ok: true, id: data.id });
}

import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { logActivity } from "@/lib/activity";
import {
  PROJECT_BILLING_TYPES,
  PROJECT_STAGES,
  type ProjectBillingType,
  type ProjectServiceCategory,
  type ProjectStage,
} from "@/lib/projects";
import { CURRENCIES, type Currency } from "@/lib/invoices";
import { cleanText, isUuid } from "@/lib/portal/admin-input";

interface CreatePayload {
  name: string;
  client_id: string;
  budget?: number;
  currency?: Currency;
  stage?: ProjectStage;
  start_date?: string;
  due_date?: string;
  service_category?: ProjectServiceCategory;
  description?: string;
  billing_type?: ProjectBillingType;
  monthly_fee?: number | null;
  billing_day?: number;
  auto_invoice?: boolean;
  domain_name?: string;
  domain_expires_on?: string;
  hosting_provider?: string;
  hosting_expires_on?: string;
  member_ids?: string[];
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

  if (payload.service_category && payload.service_category.length > 80) {
    return NextResponse.json({ ok: false, error: "Invalid service category." }, { status: 400 });
  }

  if (payload.currency && !(CURRENCIES as string[]).includes(payload.currency)) {
    return NextResponse.json({ ok: false, error: "Invalid currency." }, { status: 400 });
  }

  if (payload.stage && !(PROJECT_STAGES as string[]).includes(payload.stage)) {
    return NextResponse.json({ ok: false, error: "Invalid stage." }, { status: 400 });
  }

  if (payload.billing_type && !PROJECT_BILLING_TYPES.includes(payload.billing_type)) {
    return NextResponse.json({ ok: false, error: "Invalid billing type." }, { status: 400 });
  }
  const billingType = payload.billing_type || "one_time";
  const monthlyFee = payload.monthly_fee != null ? Number(payload.monthly_fee) : null;
  if (billingType === "monthly" && (monthlyFee === null || !Number.isFinite(monthlyFee) || monthlyFee <= 0)) {
    return NextResponse.json({ ok: false, error: "Enter the monthly fee for a monthly project." }, { status: 400 });
  }
  const billingDay = Number(payload.billing_day ?? 1);
  if (!Number.isInteger(billingDay) || billingDay < 1 || billingDay > 28) {
    return NextResponse.json({ ok: false, error: "Billing day must be between 1 and 28." }, { status: 400 });
  }

  if (payload.start_date && payload.due_date && payload.due_date < payload.start_date) {
    return NextResponse.json({ ok: false, error: "Due date cannot be before the start date." }, { status: 400 });
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
      stage: payload.stage || "planning",
      start_date: payload.start_date || null,
      due_date: payload.due_date || null,
      service_category: payload.service_category || null,
      description: payload.description?.trim() || null,
      billing_type: billingType,
      monthly_fee: billingType === "monthly" ? monthlyFee : null,
      billing_day: billingDay,
      auto_invoice: billingType === "monthly" && !!payload.auto_invoice,
      domain_name: cleanText(payload.domain_name, 200),
      domain_expires_on: payload.domain_expires_on || null,
      hosting_provider: cleanText(payload.hosting_provider, 120),
      hosting_expires_on: payload.hosting_expires_on || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[api/admin/projects] insert failed:", error);
    return NextResponse.json({ ok: false, error: "Could not create project." }, { status: 500 });
  }

  const memberIds = Array.isArray(payload.member_ids) ? [...new Set(payload.member_ids.filter(isUuid))].slice(0, 50) : [];
  if (memberIds.length) {
    const { error: memberError } = await service.from("project_members").insert(memberIds.map((employee_id) => ({ project_id: data.id, employee_id })));
    if (memberError) console.error("[api/admin/projects] members failed:", memberError);
  }

  await logActivity({
    entityType: "project",
    entityId: data.id,
    type: "project_created",
    description: `Created manually: ${payload.name.trim()}`,
  });

  return NextResponse.json({ ok: true, id: data.id });
}

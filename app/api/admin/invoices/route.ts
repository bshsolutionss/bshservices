import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { logActivity } from "@/lib/activity";
import { CURRENCIES, type Currency } from "@/lib/invoices";

interface CreatePayload {
  client_id: string;
  project_id?: string;
  amount: number;
  tax?: number;
  discount?: number;
  currency?: Currency;
  due_date?: string;
  notes?: string;
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

  if (!payload.client_id || !payload.amount || payload.amount <= 0) {
    return NextResponse.json({ ok: false, error: "Client and a positive amount are required." }, { status: 400 });
  }

  if (payload.currency && !CURRENCIES.includes(payload.currency)) {
    return NextResponse.json({ ok: false, error: "Invalid currency." }, { status: 400 });
  }

  const service = createServiceRoleClient();

  // next_invoice_number() returns a plain scalar (text), not a row set, so
  // `data` here is the string itself — no .single() needed (that's for
  // set-returning functions, like convert_lead_to_client_and_project).
  const { data: numberData, error: numberError } = await service.rpc("next_invoice_number");
  if (numberError || !numberData) {
    console.error("[api/admin/invoices] number generation failed:", numberError);
    return NextResponse.json({ ok: false, error: "Could not generate invoice number." }, { status: 500 });
  }

  const { data, error } = await service
    .from("invoices")
    .insert({
      invoice_number: numberData,
      client_id: payload.client_id,
      project_id: payload.project_id || null,
      amount: payload.amount,
      tax: payload.tax ?? 0,
      discount: payload.discount ?? 0,
      currency: payload.currency || "USD",
      due_date: payload.due_date || null,
      notes: payload.notes?.trim() || null,
      status: "draft",
    })
    .select("id, invoice_number")
    .single();

  if (error || !data) {
    console.error("[api/admin/invoices] insert failed:", error);
    return NextResponse.json({ ok: false, error: "Could not create invoice." }, { status: 500 });
  }

  await logActivity({
    entityType: "invoice",
    entityId: data.id,
    type: "invoice_created",
    description: `Invoice ${data.invoice_number} created`,
  });

  return NextResponse.json({ ok: true, id: data.id });
}

import { NextResponse, type NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/admin/api-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

export interface SearchResult {
  id: string;
  type: "lead" | "client" | "project";
  label: string;
  sublabel: string;
  href: string;
}

const RESULTS_PER_TYPE = 5;

/**
 * Global admin search — leads, clients, and projects by name/email
 * (ilike, case-insensitive substring). Kept to three tables rather than
 * every admin entity: these are the ones worth jumping straight to from
 * anywhere in the panel: everything else (invoices, tasks, expenses) is
 * reached from its owning client/project either way.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdminUser();
  if (auth.unauthorized) return auth.unauthorized;

  const q = request.nextUrl.searchParams.get("q")?.trim().slice(0, 100) ?? "";
  if (q.length < 2) {
    return NextResponse.json({ ok: true, results: [] });
  }

  const supabase = createServiceRoleClient();
  const pattern = `%${q}%`;

  const [{ data: leads }, { data: clients }, { data: projects }] = await Promise.all([
    supabase
      .from("leads")
      .select("id, name, email, business, source")
      .or(`name.ilike.${pattern},email.ilike.${pattern},business.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(RESULTS_PER_TYPE),
    supabase
      .from("clients")
      .select("id, company_name, contact_name, contact_email")
      .or(`company_name.ilike.${pattern},contact_name.ilike.${pattern},contact_email.ilike.${pattern}`)
      .limit(RESULTS_PER_TYPE),
    supabase
      .from("projects")
      .select("id, name")
      .ilike("name", pattern)
      .limit(RESULTS_PER_TYPE),
  ]);

  const results: SearchResult[] = [
    ...(leads ?? []).map((lead) => ({
      id: lead.id as string,
      type: "lead" as const,
      label: lead.name as string,
      sublabel:
        lead.source === "consultation_booking"
          ? "Consultation booking"
          : (lead.business as string | null) || (lead.email as string),
      // /admin/leads/[id] renders both a regular lead and a consultation
      // booking (see its isBooking check) — one detail route either way.
      href: `/admin/leads/${lead.id}`,
    })),
    ...(clients ?? []).map((client) => ({
      id: client.id as string,
      type: "client" as const,
      label: client.company_name as string,
      sublabel: (client.contact_name as string | null) || (client.contact_email as string),
      href: `/admin/clients/${client.id}`,
    })),
    ...(projects ?? []).map((project) => ({
      id: project.id as string,
      type: "project" as const,
      label: project.name as string,
      sublabel: "Project",
      href: `/admin/projects/${project.id}`,
    })),
  ];

  return NextResponse.json({ ok: true, results });
}

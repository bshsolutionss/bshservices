import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { EmptyState, PageHeader, SectionCard } from "@/components/admin/ui";
import { PortalRequestsList, ReviewsList } from "@/components/admin/portal/PortalActivity";
import { Gift } from "lucide-react";
import { formatDate } from "@/lib/invoices";

export const dynamic = "force-dynamic";

export default async function AdminPortalActivityPage() {
  const service = createServiceRoleClient();
  const [requestsRes, reviewsRes, referralsRes] = await Promise.all([
    service
      .from("change_requests")
      .select("id, client_id, project_id, title, details, requested_by, status, task_id, created_at, clients(company_name)")
      .order("created_at", { ascending: false })
      .limit(60),
    service
      .from("reviews")
      .select("id, kind, rating, body, display_name, approved, created_at, clients(company_name), projects(name)")
      .order("created_at", { ascending: false })
      .limit(60),
    service
      .from("referrals")
      .select("id, referred_name, referred_phone, lead_id, created_at, clients(company_name)")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v);
  const requests = requestsRes.data ?? [];
  const clientIds = [...new Set(requests.map((r) => r.client_id as string))];
  const { data: projects } = clientIds.length ? await service.from("projects").select("id, name, client_id").in("client_id", clientIds) : { data: [] };

  return (
    <div className="space-y-6">
      <PageHeader title="Portal activity" subtitle="What clients send you from their portal: change requests, reviews and referrals." />

      <SectionCard title="Change requests" subtitle={`${requests.filter((r) => r.status === "open").length} open`} padded={false}>
        <div className="p-4 sm:p-5">
          <PortalRequestsList
            rows={requests.map((r) => ({
              id: r.id,
              client_id: r.client_id,
              client_name: one(r.clients as { company_name: string } | { company_name: string }[] | null)?.company_name ?? "Client",
              project_id: r.project_id,
              title: r.title,
              details: r.details,
              requested_by: r.requested_by,
              status: r.status,
              task_id: r.task_id,
              created_at: r.created_at,
            }))}
            projects={(projects ?? []) as { id: string; name: string; client_id: string }[]}
          />
        </div>
      </SectionCard>

      <SectionCard title="Reviews & testimonials" subtitle="Approve a testimonial before using it publicly" padded={false}>
        <div className="p-4 sm:p-5">
          <ReviewsList
            rows={(reviewsRes.data ?? []).map((r) => ({
              id: r.id,
              kind: r.kind,
              rating: r.rating,
              body: r.body,
              display_name: r.display_name,
              approved: r.approved,
              created_at: r.created_at,
              client_name: one(r.clients as { company_name: string } | { company_name: string }[] | null)?.company_name ?? "Client",
              project_name: one(r.projects as { name: string } | { name: string }[] | null)?.name ?? null,
            }))}
          />
        </div>
      </SectionCard>

      <SectionCard title="Referrals" subtitle="Each one is also added to Leads automatically">
        {(referralsRes.data ?? []).length === 0 ? (
          <EmptyState icon={Gift} title="No referrals yet" description="When a client introduces someone, it appears here and in Leads." />
        ) : (
          <ul className="divide-y divide-[#1A14A5]/5">
            {(referralsRes.data ?? []).map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{r.referred_name}</p>
                  <p className="text-xs text-[#231F20]/50">
                    {r.referred_phone} · from {one(r.clients as { company_name: string } | { company_name: string }[] | null)?.company_name ?? "a client"} · {formatDate(r.created_at)}
                  </p>
                </div>
                {r.lead_id && (
                  <Link href={`/admin/leads/${r.lead_id}`} className="text-sm font-semibold text-[#1A14A5] hover:underline">
                    Open lead
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

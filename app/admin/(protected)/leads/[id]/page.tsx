import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { Lead, LeadStatus } from "@/lib/leads";
import LeadStatusControl from "@/components/admin/LeadStatusControl";

export const dynamic = "force-dynamic";

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <dt className="text-xs font-medium text-[#231F20]/50 uppercase tracking-wide">{label}</dt>
      <dd className="text-[#231F20] mt-0.5">{value}</dd>
    </div>
  );
}

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceRoleClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single<Lead>();

  if (!lead) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/leads" className="text-sm text-[#1A14A5] hover:underline">
          ← Back to Leads
        </Link>
        <h1 className="text-2xl font-extrabold text-[#231F20] mt-2">{lead.name}</h1>
        <p className="text-[#231F20]/60 text-sm">
          Submitted {new Date(lead.created_at).toLocaleString()} via{" "}
          {lead.source === "contact_form" ? "Contact Form" : "Service Form"}
          {lead.page_path ? ` (${lead.page_path})` : ""}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 p-6">
          <h2 className="font-bold text-[#231F20] mb-4">Submission Details</h2>
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <Field label="Name" value={lead.name} />
            <Field label="Email" value={lead.email} />
            <Field label="Phone" value={lead.phone} />
            <Field label="Business" value={lead.business} />
            <Field label="Best time to connect" value={lead.best_time} />
            <Field label="Service category" value={lead.service_category} />
            <Field label="Selected service" value={lead.selected_service} />
            <Field label="Business type" value={lead.business_type} />
          </dl>
          {lead.message && (
            <div className="mt-4 pt-4 border-t border-[#1A14A5]/10">
              <dt className="text-xs font-medium text-[#231F20]/50 uppercase tracking-wide">Message</dt>
              <dd className="text-[#231F20] mt-1 whitespace-pre-wrap">{lead.message}</dd>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-[#1A14A5]/10 text-xs text-[#231F20]/50 space-y-1">
            <p>
              Client confirmation email:{" "}
              {lead.client_confirmation_sent_at
                ? `sent ${new Date(lead.client_confirmation_sent_at).toLocaleString()}`
                : "not sent"}
            </p>
            <p>
              Admin notification email:{" "}
              {lead.admin_notified_at ? `sent ${new Date(lead.admin_notified_at).toLocaleString()}` : "not sent"}
            </p>
            <p>
              Follow-up sequence:{" "}
              {lead.follow_up_completed
                ? "complete"
                : `stage ${lead.follow_up_stage} of 3${
                    lead.next_follow_up_at
                      ? `, next due ${new Date(lead.next_follow_up_at).toLocaleDateString()}`
                      : ""
                  }`}
            </p>
          </div>
        </div>

        <LeadStatusControl
          leadId={lead.id}
          initialStatus={lead.status as LeadStatus}
          initialNotes={lead.notes}
        />
      </div>
    </div>
  );
}

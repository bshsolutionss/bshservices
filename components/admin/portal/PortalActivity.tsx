"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ListPlus, Star, Trash2 } from "lucide-react";
import { Alert, Badge, ConfirmButton, EmptyState, SelectField, btnSecondary } from "@/components/admin/ui";
import { Inbox } from "lucide-react";

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const REQUEST_STATUS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
  { value: "declined", label: "Declined" },
];
const REQUEST_COLORS: Record<string, { bg: string; text: string }> = {
  open: { bg: "#DBEAFE", text: "#1E40AF" },
  in_progress: { bg: "#FEF3C7", text: "#92400E" },
  done: { bg: "#D1FAE5", text: "#065F46" },
  declined: { bg: "#F3F4F6", text: "#4B5563" },
};

export interface RequestRow {
  id: string;
  client_id: string;
  client_name: string;
  project_id: string | null;
  title: string;
  details: string | null;
  requested_by: string | null;
  status: string;
  task_id: string | null;
  created_at: string;
}

export function PortalRequestsList({ rows, projects }: { rows: RequestRow[]; projects: { id: string; name: string; client_id: string }[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pick, setPick] = useState<Record<string, string>>({});

  async function patch(id: string, body: unknown) {
    setError(null);
    const res = await fetch(`/api/admin/portal/requests/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json().catch(() => null);
    if (!json?.ok) return setError(json?.error ?? "That didn't work.");
    router.refresh();
  }

  if (rows.length === 0) return <EmptyState icon={Inbox} title="No change requests" description="Requests clients send from the portal show up here." />;

  return (
    <div className="space-y-3">
      {error && <Alert tone="error">{error}</Alert>}
      {rows.map((r) => {
        const clientProjects = projects.filter((p) => p.client_id === r.client_id);
        return (
          <div key={r.id} className="rounded-xl border border-[#1A14A5]/10 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold">{r.title}</p>
                <p className="text-xs text-[#231F20]/50">
                  {r.client_name}
                  {r.requested_by && ` · ${r.requested_by}`} · {fmt(r.created_at)}
                </p>
              </div>
              <Badge label={REQUEST_STATUS.find((s) => s.value === r.status)?.label ?? r.status} colors={REQUEST_COLORS[r.status]} />
            </div>
            {r.details && <p className="mt-2 whitespace-pre-line text-sm text-[#231F20]/70">{r.details}</p>}
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <div className="w-40">
                <SelectField label="Status" value={r.status} onChange={(v) => patch(r.id, { status: v })} options={REQUEST_STATUS} />
              </div>
              {!r.task_id && (
                <>
                  {!r.project_id && (
                    <div className="w-48">
                      <SelectField
                        label="Project"
                        value={pick[r.id] ?? ""}
                        onChange={(v) => setPick({ ...pick, [r.id]: v })}
                        options={clientProjects.map((p) => ({ value: p.id, label: p.name }))}
                        placeholder="Choose project"
                      />
                    </div>
                  )}
                  <button className={btnSecondary} onClick={() => patch(r.id, { action: "to_task", projectId: pick[r.id] || undefined })}>
                    <ListPlus className="h-4 w-4" /> Make a task
                  </button>
                </>
              )}
              {r.task_id && <span className="pb-2 text-xs font-semibold text-emerald-700">Task created</span>}
              <ConfirmButton
                display="inline"
                label=""
                icon={<Trash2 className="h-4 w-4" />}
                className="pb-2"
                title="Delete this request?"
                message="It's removed from the client's list too."
                onConfirm={async () => {
                  const res = await fetch(`/api/admin/portal/requests/${r.id}`, { method: "DELETE" });
                  if (!res.ok) throw new Error("Could not delete.");
                  router.refresh();
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export interface ReviewRow {
  id: string;
  kind: string;
  rating: number | null;
  body: string | null;
  display_name: string | null;
  approved: boolean;
  created_at: string;
  client_name: string;
  project_name: string | null;
}

export function ReviewsList({ rows }: { rows: ReviewRow[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function approve(id: string, approved: boolean) {
    setError(null);
    const res = await fetch(`/api/admin/portal/reviews/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ approved }) });
    const json = await res.json().catch(() => null);
    if (!json?.ok) return setError(json?.error ?? "That didn't work.");
    router.refresh();
  }

  if (rows.length === 0) return <EmptyState icon={Star} title="No reviews yet" description="Project reviews and testimonials from clients appear here." />;

  return (
    <div className="space-y-3">
      {error && <Alert tone="error">{error}</Alert>}
      {rows.map((r) => (
        <div key={r.id} className="rounded-xl border border-[#1A14A5]/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 font-semibold">
                {r.display_name ?? r.client_name}
                {r.rating && (
                  <span className="inline-flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </span>
                )}
              </p>
              <p className="text-xs text-[#231F20]/50">
                {r.client_name} · {r.kind === "testimonial" ? "Testimonial" : `Review${r.project_name ? ` of ${r.project_name}` : ""}`} · {fmt(r.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {r.kind === "testimonial" &&
                (r.approved ? (
                  <button onClick={() => approve(r.id, false)} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline">
                    <Check className="h-3.5 w-3.5" /> Approved - unapprove
                  </button>
                ) : (
                  <button onClick={() => approve(r.id, true)} className={btnSecondary}>
                    Approve
                  </button>
                ))}
              <ConfirmButton
                display="inline"
                label=""
                icon={<Trash2 className="h-4 w-4" />}
                title="Delete this review?"
                message="This permanently removes it."
                onConfirm={async () => {
                  const res = await fetch(`/api/admin/portal/reviews/${r.id}`, { method: "DELETE" });
                  if (!res.ok) throw new Error("Could not delete.");
                  router.refresh();
                }}
              />
            </div>
          </div>
          {r.body && <p className="mt-2 text-sm text-[#231F20]/70">&ldquo;{r.body}&rdquo;</p>}
        </div>
      ))}
    </div>
  );
}

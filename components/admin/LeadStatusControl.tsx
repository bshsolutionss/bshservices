"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, type LeadStatus } from "@/lib/leads";

interface LeadStatusControlProps {
  leadId: string;
  initialStatus: LeadStatus;
  initialNotes: string | null;
}

/**
 * The only client component on the lead detail page — everything else is
 * server-rendered. Saves status + notes together in one PATCH, then
 * refreshes the server-rendered page to reflect the change.
 */
export default function LeadStatusControl({
  leadId,
  initialStatus,
  initialNotes,
}: LeadStatusControlProps) {
  const router = useRouter();
  const [status, setStatus] = useState<LeadStatus>(initialStatus);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });

      if (!res.ok) throw new Error("Save failed");

      setSaved(true);
      router.refresh();
    } catch {
      // Keep it simple for v1 — a console error is enough signal for the admin to retry.
      console.error("Failed to save lead updates");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 p-6 space-y-4">
      <h2 className="font-bold text-[#231F20]">Status & Notes</h2>

      <div>
        <label className="text-sm font-medium text-[#231F20]/70 block mb-1.5">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as LeadStatus)}
          className="w-full rounded-lg border border-[#1A14A5]/20 px-3 py-2 text-sm bg-white"
        >
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {LEAD_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        {status !== "new" && status !== "contacted" && (
          <p className="text-xs text-[#231F20]/50 mt-1.5">
            Saving this will stop automated follow-up emails for this lead.
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-[#231F20]/70 block mb-1.5">Notes</label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder="Internal notes about this lead..."
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-xl"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
        {saved && <span className="text-sm text-green-600">✅ Saved</span>}
      </div>
    </div>
  );
}

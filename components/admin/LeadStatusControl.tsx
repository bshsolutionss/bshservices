"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  LEAD_PRIORITIES,
  LEAD_PRIORITY_LABELS,
  LEAD_LOST_REASONS,
  LEAD_LOST_REASON_LABELS,
  type LeadStatus,
  type LeadPriority,
  type LeadLostReason,
} from "@/lib/leads";

interface LeadStatusControlProps {
  leadId: string;
  initialStatus: LeadStatus;
  initialNotes: string | null;
  initialPriority: LeadPriority;
  initialExpectedValue: number | null;
  initialLostReason: LeadLostReason | null;
}

/**
 * The only client component on the lead detail page — everything else is
 * server-rendered. Saves status/priority/expected value/notes together in
 * one PATCH, then refreshes the server-rendered page to reflect the change.
 */
export default function LeadStatusControl({
  leadId,
  initialStatus,
  initialNotes,
  initialPriority,
  initialExpectedValue,
  initialLostReason,
}: LeadStatusControlProps) {
  const router = useRouter();
  const [status, setStatus] = useState<LeadStatus>(initialStatus);
  const [priority, setPriority] = useState<LeadPriority>(initialPriority);
  const [expectedValue, setExpectedValue] = useState(
    initialExpectedValue !== null ? String(initialExpectedValue) : ""
  );
  const [lostReason, setLostReason] = useState<LeadLostReason | "">(initialLostReason ?? "");
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          notes,
          priority,
          expected_value: expectedValue === "" ? null : Number(expectedValue),
          ...(lostReason ? { lost_reason: lostReason } : {}),
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Save failed");

      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save lead updates.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 p-6 space-y-4">
      <h2 className="font-bold text-[#231F20]">Deal Status</h2>

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
        {status === "won" && (
          <p className="text-xs text-[#1A14A5] mt-1.5">
            Saving this will automatically create/link a Client and Project.
          </p>
        )}
      </div>

      {status === "lost" && (
        <div>
          <label className="text-sm font-medium text-[#231F20]/70 block mb-1.5">Lost Reason</label>
          <select
            value={lostReason}
            onChange={(e) => setLostReason(e.target.value as LeadLostReason)}
            className="w-full rounded-lg border border-[#1A14A5]/20 px-3 py-2 text-sm bg-white"
          >
            <option value="">Select a reason…</option>
            {LEAD_LOST_REASONS.map((r) => (
              <option key={r} value={r}>
                {LEAD_LOST_REASON_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-[#231F20]/70 block mb-1.5">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as LeadPriority)}
            className="w-full rounded-lg border border-[#1A14A5]/20 px-3 py-2 text-sm bg-white"
          >
            {LEAD_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {LEAD_PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-[#231F20]/70 block mb-1.5">Expected Value</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={expectedValue}
            onChange={(e) => setExpectedValue(e.target.value)}
            placeholder="0.00"
          />
        </div>
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
        {error && <span className="text-sm text-red-600">❌ {error}</span>}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, MessageSquareWarning } from "lucide-react";
import { portalBtn, portalBtnGhost, portalTextarea } from "@/components/portal/ui";

export default function ApprovalActions({ id }: { id: string }) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function respond(decision: "approved" | "changes_requested") {
    if (decision === "changes_requested" && !comment.trim()) {
      setError("Tell us what you'd like changed.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/portal/approvals/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, comment }),
    });
    const json = await res.json().catch(() => null);
    setBusy(false);
    if (!json?.ok) {
      setError(json?.error ?? "Could not save. Try again.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-4 space-y-3">
      {asking && (
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="What would you like changed?" className={portalTextarea} maxLength={2000} />
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {!asking && (
          <button disabled={busy} onClick={() => respond("approved")} className={portalBtn}>
            <Check className="h-4 w-4" /> Approve
          </button>
        )}
        {asking ? (
          <>
            <button disabled={busy} onClick={() => respond("changes_requested")} className={portalBtn}>
              Send feedback
            </button>
            <button disabled={busy} onClick={() => setAsking(false)} className={portalBtnGhost}>
              Cancel
            </button>
          </>
        ) : (
          <button disabled={busy} onClick={() => setAsking(true)} className={portalBtnGhost}>
            <MessageSquareWarning className="h-4 w-4" /> Request changes
          </button>
        )}
      </div>
    </div>
  );
}

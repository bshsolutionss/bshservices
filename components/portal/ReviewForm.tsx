"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { portalBtn, portalCard, portalInput, portalTextarea } from "@/components/portal/ui";

interface Props {
  /** Present for a project review; absent for a general testimonial. */
  projectId?: string;
  defaultName: string;
  existing?: { rating: number; body: string } | null;
  prompt?: string;
}

export default function ReviewForm({ projectId, defaultName, existing, prompt }: Props) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [body, setBody] = useState(existing?.body ?? "");
  const [name, setName] = useState(defaultName);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    existing ? { ok: true, text: "Thanks - you've already shared your feedback. You can update it below." } : null
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating && !body.trim()) {
      setMessage({ ok: false, text: "Pick a star rating or write a few words first." });
      return;
    }
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/portal/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, rating: rating || null, body, displayName: name }),
    });
    const json = await res.json().catch(() => null);
    setBusy(false);
    setMessage(json?.ok ? { ok: true, text: "Thank you - we really appreciate it." } : { ok: false, text: json?.error ?? "Could not save. Try again." });
  }

  return (
    <form onSubmit={submit} className={`${portalCard} space-y-4 p-5`}>
      <p className="text-sm text-stone-600">{prompt ?? "How was working with us on this project?"}</p>
      <div className="flex gap-1.5" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`} className="p-0.5">
            <Star className={cn("h-8 w-8 transition", n <= rating ? "fill-amber-400 text-amber-400" : "text-stone-200 hover:text-amber-300")} />
          </button>
        ))}
      </div>
      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Share your experience (optional)" className={portalTextarea} maxLength={2000} />
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-stone-700">Your name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className={portalInput} maxLength={120} />
        <p className="mt-1.5 text-xs text-stone-400">If we ever feature your words publicly we&apos;ll ask first.</p>
      </div>
      {message && <p className={cn("rounded-xl px-3 py-2 text-sm", message.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>{message.text}</p>}
      <button type="submit" disabled={busy} className={portalBtn}>
        {busy ? "Sending..." : "Submit review"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { portalBtn, portalCard, portalInput, portalTextarea } from "@/components/portal/ui";

export default function ChangeRequestForm({ projects }: { projects: { id: string; name: string }[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [projectId, setProjectId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setMessage({ ok: false, text: "Tell us what you'd like to change or add." });
      return;
    }
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/portal/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, details, projectId: projectId || null }),
    });
    const json = await res.json().catch(() => null);
    setBusy(false);
    if (!json?.ok) {
      setMessage({ ok: false, text: json?.error ?? "Could not send. Try again." });
      return;
    }
    setTitle("");
    setDetails("");
    setMessage({ ok: true, text: "Sent - we'll get back to you soon." });
    router.refresh();
  }

  return (
    <form onSubmit={submit} className={`${portalCard} space-y-3 p-5`}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What would you like to change or add?" className={portalInput} maxLength={200} />
      <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} placeholder="Describe it in a bit more detail..." className={portalTextarea} maxLength={4000} />
      {projects.length > 1 && (
        <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={portalInput}>
          <option value="">Not about a specific project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      )}
      {message && <p className={cn("rounded-xl px-3 py-2 text-sm", message.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>{message.text}</p>}
      <button type="submit" disabled={busy} className={portalBtn}>
        <Send className="h-4 w-4" /> {busy ? "Sending..." : "Submit request"}
      </button>
    </form>
  );
}

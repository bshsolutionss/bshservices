"use client";

import { useState } from "react";
import { Send, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { portalBtn, portalCard, portalInput, portalTextarea } from "@/components/portal/ui";

export default function ReferralForm({ supportEmail }: { supportEmail: string }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", note: "" });
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/portal/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, consent }),
    });
    const json = await res.json().catch(() => null);
    setBusy(false);
    if (!json?.ok) {
      setMessage({ ok: false, text: json?.error ?? "Could not send. Try again." });
      return;
    }
    setForm({ name: "", phone: "", email: "", note: "" });
    setConsent(false);
    setMessage({ ok: true, text: "Thank you! We'll reach out and take it from there." });
  }

  return (
    <form onSubmit={submit} className={`${portalCard} space-y-3 p-5`}>
      <div className="mb-1 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100/80 text-orange-600">
          <UserPlus className="h-[18px] w-[18px]" />
        </span>
        <div>
          <p className="font-semibold">Introduce someone</p>
          <p className="text-xs text-stone-500">We&apos;ll reach out and take it from there.</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input value={form.name} onChange={set("name")} placeholder="Their name *" className={portalInput} maxLength={200} required />
        <input value={form.phone} onChange={set("phone")} placeholder="Their phone *" className={portalInput} maxLength={60} required />
      </div>
      <input type="email" value={form.email} onChange={set("email")} placeholder="Their email (optional)" className={portalInput} maxLength={320} />
      <textarea value={form.note} onChange={set("note")} rows={3} placeholder="Anything we should know? (optional)" className={portalTextarea} maxLength={2000} />
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-stone-200 p-3">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-orange-600" />
        <span className="text-sm">
          <span className="font-medium text-stone-900">I have this person&apos;s permission to share their details</span>{" "}
          <span className="text-xs text-stone-400">(required)</span>
          <span className="mt-1 block text-xs text-stone-500">
            You are giving us someone else&apos;s personal data. They need to know and agree before you share it, so please confirm you have asked them.
          </span>
        </span>
      </label>
      <p className="text-xs text-stone-400">
        Questions or complaints about how we handle data: <a className="text-orange-600 underline" href={`mailto:${supportEmail}`}>{supportEmail}</a>.
      </p>
      {message && <p className={cn("rounded-xl px-3 py-2 text-sm", message.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>{message.text}</p>}
      <button type="submit" disabled={busy || !consent} className={portalBtn}>
        <Send className="h-4 w-4" /> {busy ? "Sending..." : "Refer them"}
      </button>
    </form>
  );
}

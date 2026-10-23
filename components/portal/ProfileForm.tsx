"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import { portalBtn, portalCard, portalInput } from "@/components/portal/ui";

type Msg = { ok: boolean; text: string } | null;

export default function ProfileForm({ email, initialName }: { email: string; initialName: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [nameMsg, setNameMsg] = useState<Msg>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwMsg, setPwMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/portal/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const json = await res.json().catch(() => null);
    setBusy(false);
    setNameMsg(json?.ok ? { ok: true, text: "Saved." } : { ok: false, text: json?.error ?? "Could not save." });
    if (json?.ok) router.refresh();
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setPwMsg({ ok: false, text: "Use at least 8 characters." });
    if (password !== confirm) return setPwMsg({ ok: false, text: "The two passwords don't match." });
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);
    if (error) return setPwMsg({ ok: false, text: error.message });
    setPassword("");
    setConfirm("");
    setPwMsg({ ok: true, text: "Password changed." });
  }

  const note = (m: Msg) =>
    m && <p className={cn("rounded-xl px-3 py-2 text-sm", m.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>{m.text}</p>;

  return (
    <div className="space-y-4">
      <form onSubmit={saveName} className={`${portalCard} space-y-3 p-5`}>
        <p className="font-semibold">Your details</p>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-stone-700">Email</label>
          <input value={email} disabled className={`${portalInput} bg-stone-50 text-stone-500`} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-stone-700">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={portalInput} maxLength={120} required />
        </div>
        {note(nameMsg)}
        <button type="submit" disabled={busy} className={portalBtn}>
          Save
        </button>
      </form>
      <form onSubmit={savePassword} className={`${portalCard} space-y-3 p-5`}>
        <p className="font-semibold">Change password</p>
        <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className={portalInput} />
        <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat new password" className={portalInput} />
        {note(pwMsg)}
        <button type="submit" disabled={busy} className={portalBtn}>
          Update password
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { portalBtn, portalInput } from "@/components/portal/ui";

export default function SetPasswordForm({ name }: { name: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("The two passwords don't match.");
    setBusy(true);
    const { error: updateError } = await createClient().auth.updateUser({ password });
    if (updateError) {
      setBusy(false);
      return setError(updateError.message);
    }
    // Only now is the temporary password out of circulation - clear the flag.
    const res = await fetch("/api/team/password-done", { method: "POST" });
    if (!res.ok) {
      setBusy(false);
      return setError("Your password was changed but we couldn't finish. Sign out and back in with the new password.");
    }
    router.push("/team");
    router.refresh();
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#FAF8F6] px-5">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-3xl border border-stone-200/70 bg-white p-8 shadow-[0_8px_30px_-12px_rgba(28,25,23,0.15)]">
        <div className="mb-2 text-center">
          <h1 className="text-xl font-semibold text-stone-900">Welcome, {name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-stone-500">Choose your own password to continue. The temporary one you were given stops working.</p>
        </div>
        <input type="password" autoComplete="new-password" required placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} className={portalInput} />
        <input type="password" autoComplete="new-password" required placeholder="Repeat new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={portalInput} />
        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-center text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={busy} className={`${portalBtn} w-full`}>
          {busy ? "Saving..." : "Set password and continue"}
        </button>
      </form>
    </div>
  );
}

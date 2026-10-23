"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { portalBtn, portalInput } from "@/components/portal/ui";

interface LoginFormProps {
  noAccess: boolean;
  /** Where to go after signing in. */
  redirectTo?: string;
  title?: string;
  subtitle?: string;
  noAccessText?: string;
  helpText?: string;
}

export default function LoginForm({
  noAccess,
  redirectTo = "/portal",
  title = "BSH Solutions client portal",
  subtitle = "Sign in to follow your projects, invoices and messages.",
  noAccessText = "This account doesn't have portal access. Ask your account manager to invite you.",
  helpText = "Forgot your password? Message your account manager and they'll send a new one.",
}: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    noAccess ? noAccessText : null
  );
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (signInError) {
      setError("That email and password don't match.");
      setLoading(false);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#FAF8F6] px-5">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-3xl border border-stone-200/70 bg-white p-8 shadow-[0_8px_30px_-12px_rgba(28,25,23,0.15)]">
        <div className="mb-2 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-orange-100 text-lg font-bold text-orange-600">B</span>
          <h1 className="mt-4 text-xl font-semibold text-stone-900">{title}</h1>
          <p className="mt-1 text-sm text-stone-500">{subtitle}</p>
        </div>
        <input
          type="email"
          required
          autoComplete="username"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={portalInput}
        />
        <input
          type="password"
          required
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={portalInput}
        />
        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-center text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={loading} className={`${portalBtn} w-full`}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <p className="text-center text-xs text-stone-400">{helpText}</p>
      </form>
    </div>
  );
}

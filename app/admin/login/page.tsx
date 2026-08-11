"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 space-y-5"
      >
        <div className="text-center mb-2">
          <h1 className="text-2xl font-extrabold text-[#1A14A5]">BSH Admin</h1>
          <p className="text-sm text-[#231F20]/60 mt-1">Sign in to manage leads</p>
        </div>

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-xl py-5"
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
}

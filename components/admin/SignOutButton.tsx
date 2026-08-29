"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

interface SignOutButtonProps {
  className?: string;
  /** "dark" (default) — for the navy sidebar. "light" — for a white dropdown/header. */
  variant?: "dark" | "light";
}

export default function SignOutButton({ className, variant = "dark" }: SignOutButtonProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className={cn(
        "flex items-center gap-3 text-sm font-medium transition rounded-xl",
        variant === "dark" ? "text-white/70 hover:text-white hover:bg-white/10" : "text-[#231F20]/70 hover:text-[#231F20] hover:bg-[#F4F7FE]",
        className
      )}
    >
      <LogOut className="w-[18px] h-[18px] shrink-0" />
      Sign out
    </button>
  );
}

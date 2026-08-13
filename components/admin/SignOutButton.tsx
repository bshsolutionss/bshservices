"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

export default function SignOutButton({ className }: { className?: string }) {
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
        "flex items-center gap-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition rounded-xl",
        className
      )}
    >
      <LogOut className="w-[18px] h-[18px] shrink-0" />
      Sign out
    </button>
  );
}

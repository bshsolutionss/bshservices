"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, Maximize, Minimize, User } from "lucide-react";
import AdminSearch from "@/components/admin/AdminSearch";
import SignOutButton from "@/components/admin/SignOutButton";

interface AdminHeaderProps {
  onOpenMobileMenu: () => void;
  userEmail: string | null;
}

/** Fullscreen toggle — same expand/shrink icon pattern as the reference admin header. */
function FullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(() => {
        // Fullscreen can be denied (permissions policy, iframe, etc.) — fail silently.
      });
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      className="p-2 rounded-lg text-[#231F20]/60 hover:text-[#1A14A5] hover:bg-[#F4F7FE] transition"
    >
      {isFullscreen ? <Minimize className="w-[18px] h-[18px]" /> : <Maximize className="w-[18px] h-[18px]" />}
    </button>
  );
}

function AccountMenu({ userEmail }: { userEmail: string | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const initial = userEmail?.[0]?.toUpperCase() ?? <User className="w-4 h-4" />;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        className="w-9 h-9 rounded-full bg-[#1A14A5] text-white flex items-center justify-center font-bold text-sm hover:opacity-90 transition"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#1A14A5]/10 py-2 z-50">
          {userEmail && (
            <p className="px-4 py-2 text-xs text-[#231F20]/50 truncate border-b border-[#1A14A5]/5 mb-1">{userEmail}</p>
          )}
          <SignOutButton variant="light" className="w-full px-4 py-2" />
        </div>
      )}
    </div>
  );
}

/**
 * Top header bar — spans the full width of the content area (right of the
 * sidebar on desktop, full-width on mobile). Sticky so search/account/
 * fullscreen stay reachable while a long list scrolls underneath.
 */
export default function AdminHeader({ onOpenMobileMenu, userEmail }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#1A14A5]/10 shadow-sm">
      <div className="flex items-center gap-3 px-4 md:px-6 py-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open menu"
          className="md:hidden p-1.5 -ml-1.5 text-[#231F20]/70 hover:text-[#1A14A5]"
        >
          <Menu className="w-6 h-6" />
        </button>

        <AdminSearch className="max-w-md" />

        <div className="ml-auto flex items-center gap-1.5">
          <FullscreenToggle />
          <AccountMenu userEmail={userEmail} />
        </div>
      </div>
    </header>
  );
}

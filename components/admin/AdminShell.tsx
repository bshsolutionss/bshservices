"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { RoleProvider } from "@/components/admin/RoleContext";
import ToastProvider from "@/components/admin/ui/Toast";
import type { Role } from "@/lib/permissions";

interface AdminShellProps {
  children: React.ReactNode;
  userEmail: string | null;
  role: Role;
}

/**
 * Owns the one bit of state AdminSidebar (mobile drawer) and AdminHeader
 * (its hamburger trigger) both need — they're siblings, not parent/child,
 * so it's lifted here rather than into either of them.
 */
export default function AdminShell({ children, userEmail, role }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <RoleProvider role={role}>
    <ToastProvider>
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#1A14A5] focus:shadow-lg"
      >
        Skip to content
      </a>
      <AdminSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="md:pl-24">
        <AdminHeader onOpenMobileMenu={() => setMobileOpen(true)} userEmail={userEmail} />
        {/* Full-width canvas — no max-w constraint, matches every other
            admin page's edge-to-edge layout instead of centering in a
            narrower column. */}
        <main id="admin-main" tabIndex={-1} className="w-full px-4 md:px-8 py-8 outline-none">
          {children}
        </main>
      </div>
    </ToastProvider>
    </RoleProvider>
  );
}

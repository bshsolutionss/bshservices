"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

interface AdminShellProps {
  children: React.ReactNode;
  userEmail: string | null;
}

/**
 * Owns the one bit of state AdminSidebar (mobile drawer) and AdminHeader
 * (its hamburger trigger) both need — they're siblings, not parent/child,
 * so it's lifted here rather than into either of them.
 */
export default function AdminShell({ children, userEmail }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <AdminSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="md:pl-24">
        <AdminHeader onOpenMobileMenu={() => setMobileOpen(true)} userEmail={userEmail} />
        {/* Full-width canvas — no max-w constraint, matches every other
            admin page's edge-to-edge layout instead of centering in a
            narrower column. */}
        <main className="w-full px-4 md:px-8 py-8">{children}</main>
      </div>
    </>
  );
}

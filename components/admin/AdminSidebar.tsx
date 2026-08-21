"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Building2,
  FolderKanban,
  CheckSquare,
  Receipt,
  Wallet,
  Contact,
  Clock,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SignOutButton from "@/components/admin/SignOutButton";
import InstallAppButton from "@/components/InstallAppButton";
import PushNotificationToggle from "@/components/admin/PushNotificationToggle";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Only match this exact path — used for Dashboard so it doesn't stay "active" under every sub-route. */
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/clients", label: "Clients", icon: Building2 },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/admin/invoices", label: "Invoices", icon: Receipt },
  { href: "/admin/expenses", label: "Expenses", icon: Wallet },
  { href: "/admin/employees", label: "Employees", icon: Contact },
  { href: "/admin/availability", label: "Availability", icon: Clock },
];

function isActivePath(pathname: string, item: NavItem): boolean {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActivePath(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition",
              active ? "bg-white text-[#1A14A5] shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="w-[18px] h-[18px] shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Admin shell navigation — a fixed left sidebar on desktop, a slide-in
 * drawer (behind a topbar hamburger) on mobile. Every /admin/(protected)
 * page renders inside app/admin/(protected)/layout.tsx, which reserves
 * space for the desktop sidebar via `md:pl-64`.
 */
export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile topbar */}
      <div className="md:hidden sticky top-0 z-40 bg-[#1A14A5] text-white flex items-center justify-between px-4 py-3 shadow-sm">
        <span className="font-extrabold tracking-tight">BSH Admin</span>
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="p-1">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#1A14A5] flex flex-col py-6">
            <div className="flex items-center justify-between px-4 mb-6">
              <span className="font-extrabold text-white tracking-tight">BSH Admin</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-1">
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            <div className="px-3 pt-4 mt-4 border-t border-white/10 space-y-1">
              <PushNotificationToggle className="w-full" />
              <InstallAppButton variant="inline" className="w-full" />
              <SignOutButton className="w-full px-3 py-2.5" />
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 bg-[#1A14A5] py-6">
        <div className="px-5 mb-6">
          <span className="font-extrabold text-white text-lg tracking-tight">BSH Admin</span>
        </div>
        <NavLinks pathname={pathname} />
        <div className="px-3 pt-4 mt-4 border-t border-white/10 space-y-1">
          <PushNotificationToggle className="w-full" />
          <InstallAppButton variant="inline" className="w-full" />
          <SignOutButton className="w-full px-3 py-2.5" />
        </div>
      </aside>
    </>
  );
}

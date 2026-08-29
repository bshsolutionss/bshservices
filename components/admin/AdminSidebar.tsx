"use client";

import { useEffect, useState } from "react";
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
  Settings,
  Coins,
  ChevronDown,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import InstallAppButton from "@/components/InstallAppButton";
import PushNotificationToggle from "@/components/admin/PushNotificationToggle";

interface SubNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Present only on groups with a single destination (Dashboard) — clicking navigates straight there instead of opening a flyout. */
  href?: string;
  items?: SubNavItem[];
}

// Grouped from the previous flat 10-item list into 5 rail icons — a
// two-tier "icon rail + flyout panel" nav (layout borrowed from a reference
// screenshot the user provided; colors/branding stayed BSH's own).
const NAV_GROUPS: NavGroup[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  {
    id: "pipeline",
    label: "Pipeline",
    icon: Users,
    items: [
      { href: "/admin/leads", label: "Leads", icon: Users },
      { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
    ],
  },
  {
    id: "work",
    label: "Clients",
    icon: Building2,
    items: [
      { href: "/admin/clients", label: "Clients", icon: Building2 },
      { href: "/admin/projects", label: "Projects", icon: FolderKanban },
      { href: "/admin/tasks", label: "Tasks", icon: CheckSquare },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    icon: Wallet,
    items: [
      { href: "/admin/invoices", label: "Invoices", icon: Receipt },
      { href: "/admin/expenses", label: "Expenses", icon: Wallet },
    ],
  },
  {
    id: "team",
    label: "Team",
    icon: Contact,
    items: [
      { href: "/admin/employees", label: "Employees", icon: Contact },
      { href: "/admin/availability", label: "Availability", icon: Clock },
    ],
  },
];

function isPathActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function isGroupActive(pathname: string, group: NavGroup): boolean {
  if (group.href) return isPathActive(pathname, group.href);
  return group.items?.some((item) => isPathActive(pathname, item.href)) ?? false;
}

interface AdminSidebarProps {
  /** Mobile drawer open/close — lifted to components/admin/AdminShell.tsx so
   *  AdminHeader's hamburger (a sibling, not a parent/child of this component)
   *  can open it too. */
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

/**
 * Admin shell navigation. Desktop: a narrow icon rail (DesktopRail) where
 * each grouped item opens an adjacent flyout panel listing its real pages —
 * only Dashboard (no sub-pages) links straight through. Mobile: the same
 * groups as an accordion inside the existing slide-in drawer.
 */
export default function AdminSidebar({ mobileOpen, onCloseMobile }: AdminSidebarProps) {
  return (
    <>
      <MobileDrawer open={mobileOpen} onClose={onCloseMobile} />
      <DesktopRail />
    </>
  );
}

// No Sign Out button here anymore — it lives in AdminHeader's account menu
// (top-right avatar, reachable on every breakpoint), so it isn't duplicated
// in two places now that the rail is icon-first and space is tighter.
function SettingsPanelContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <Link
        href="/admin/settings/exchange-rates"
        onClick={onNavigate}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition"
      >
        <Coins className="w-[18px] h-[18px] shrink-0" />
        Exchange Rates
      </Link>
      <PushNotificationToggle className="w-full" />
      <InstallAppButton variant="inline" className="w-full" />
    </>
  );
}

/** Desktop: fixed icon rail + a flyout panel that overlays the page content (with a dimming backdrop), matching the reference layout. */
function DesktopRail() {
  const pathname = usePathname();
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);

  // Close the flyout on route change and on Escape — it's a transient
  // overlay, not a persistent second column.
  useEffect(() => setOpenGroupId(null), [pathname]);
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenGroupId(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const openGroup = NAV_GROUPS.find((g) => g.id === openGroupId);

  return (
    <div className="hidden md:block">
      {/* Icon rail */}
      <aside className="fixed inset-y-0 left-0 z-40 w-24 bg-[#1A14A5] flex flex-col items-center py-6">
        <div className="mb-6">
          <span className="font-extrabold text-white text-xs tracking-tight">BSH Admin</span>
        </div>

        <nav className="flex-1 w-full px-2 space-y-1 overflow-y-auto">
          {NAV_GROUPS.map((group) => {
            const Icon = group.icon;
            const active = isGroupActive(pathname, group) || openGroupId === group.id;
            const commonClasses = cn(
              "w-full flex flex-col items-center gap-1.5 px-1 py-2.5 rounded-xl text-[11px] font-medium transition",
              active ? "bg-white text-[#1A14A5] shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white"
            );

            if (group.href) {
              return (
                <Link key={group.id} href={group.href} className={commonClasses}>
                  <Icon className="w-5 h-5 shrink-0" />
                  {group.label}
                </Link>
              );
            }

            return (
              <button
                key={group.id}
                type="button"
                onClick={() => setOpenGroupId((current) => (current === group.id ? null : group.id))}
                aria-expanded={openGroupId === group.id}
                className={commonClasses}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {group.label}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setOpenGroupId((current) => (current === "settings" ? null : "settings"))}
          aria-expanded={openGroupId === "settings"}
          className={cn(
            "w-[calc(100%-1rem)] mx-2 flex flex-col items-center gap-1.5 px-1 py-2.5 rounded-xl text-[11px] font-medium transition mt-2",
            openGroupId === "settings" ? "bg-white text-[#1A14A5] shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white"
          )}
        >
          <Settings className="w-5 h-5 shrink-0" />
          Settings
        </button>
      </aside>

      {/* Backdrop + flyout — overlays the page content rather than pushing it, same as the reference. */}
      {openGroupId && (
        <>
          <div className="fixed inset-y-0 left-24 right-0 z-40 bg-black/30" onClick={() => setOpenGroupId(null)} />
          <div className="fixed inset-y-0 left-24 z-40 w-64 bg-[#1A14A5] py-6 px-3 shadow-2xl">
            {openGroupId === "settings" ? (
              <>
                <p className="px-3 pb-3 text-xs font-bold uppercase tracking-wide text-white/40">Settings</p>
                <div className="space-y-1">
                  <SettingsPanelContent />
                </div>
              </>
            ) : (
              openGroup?.items && (
                <>
                  <p className="px-3 pb-3 text-xs font-bold uppercase tracking-wide text-white/40">{openGroup.label}</p>
                  <div className="space-y-1">
                    {openGroup.items.map((item) => {
                      const ItemIcon = item.icon;
                      const active = isPathActive(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition",
                            active ? "bg-white text-[#1A14A5] shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          <ItemIcon className="w-[18px] h-[18px] shrink-0" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}

/** Mobile: the same groups as a slide-in accordion — a second flyout column doesn't make sense at phone widths. */
function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const activeGroup = NAV_GROUPS.find((g) => !g.href && isGroupActive(pathname, g));
    return new Set(activeGroup ? [activeGroup.id] : []);
  });

  const toggleGroup = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!open) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-80 bg-[#1A14A5] flex flex-col py-6">
        <div className="flex items-center justify-between px-4 mb-6">
          <span className="font-extrabold text-white tracking-tight">BSH Admin</span>
          <button onClick={onClose} aria-label="Close menu" className="p-1">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV_GROUPS.map((group) => {
            const Icon = group.icon;

            if (group.href) {
              const active = isPathActive(pathname, group.href);
              return (
                <Link
                  key={group.id}
                  href={group.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition",
                    active ? "bg-white text-[#1A14A5] shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  {group.label}
                </Link>
              );
            }

            const isOpen = expanded.has(group.id);
            const active = isGroupActive(pathname, group);

            return (
              <div key={group.id}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={isOpen}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition",
                    active && !isOpen ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span className="flex-1 text-left">{group.label}</span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <div className="mt-1 ml-6 space-y-1 border-l border-white/10 pl-3">
                    {group.items?.map((item) => {
                      const ItemIcon = item.icon;
                      const itemActive = isPathActive(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition",
                            itemActive ? "bg-white text-[#1A14A5] shadow-sm" : "text-white/60 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          <ItemIcon className="w-4 h-4 shrink-0" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="px-3 pt-4 mt-4 border-t border-white/10 space-y-1">
          <SettingsPanelContent onNavigate={onClose} />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FileText,
  FolderKanban,
  Gift,
  Home,
  KanbanSquare,
  Menu,
  MessagesSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/browser";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badgeKey?: "unreadMessages" | "pendingApprovals";
}

const NAV: NavItem[] = [
  { href: "/portal", label: "Home", icon: Home },
  { href: "/portal/projects", label: "Projects", icon: FolderKanban },
  { href: "/portal/messages", label: "Messages", icon: MessagesSquare, badgeKey: "unreadMessages" },
  { href: "/portal/billing", label: "Billing", icon: Wallet },
  { href: "/portal/tasks", label: "Tasks", icon: KanbanSquare },
  { href: "/portal/meetings", label: "Meetings", icon: CalendarDays },
  { href: "/portal/requests", label: "Requests", icon: ClipboardList, badgeKey: "pendingApprovals" },
  { href: "/portal/documents", label: "Documents", icon: FileText },
  { href: "/portal/referrals", label: "Referrals", icon: Gift },
  { href: "/portal/welcome", label: "Welcome", icon: Sparkles },
];

interface Notification {
  id: string;
  title: string;
  body: string | null;
  href: string | null;
  read_at: string | null;
  created_at: string;
}

interface Props {
  clientName: string;
  userName: string;
  counts: { unreadMessages: number; pendingApprovals: number };
  children: React.ReactNode;
}

export default function PortalShell({ clientName, userName, counts, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notes, setNotes] = useState<Notification[]>([]);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("portal-collapsed") === "1");
    } catch {
      // Private mode - the sidebar just starts expanded.
    }
  }, []);
  useEffect(() => setMobileOpen(false), [pathname]);

  const loadNotes = useCallback(async () => {
    try {
      const res = await fetch("/api/portal/notifications", { cache: "no-store" });
      const json = await res.json();
      if (json.ok) setNotes(json.notifications);
    } catch {
      // Offline - keep what we have.
    }
  }, []);
  useEffect(() => {
    loadNotes();
    const t = setInterval(loadNotes, 30_000);
    return () => clearInterval(t);
  }, [loadNotes]);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        setBellOpen(false);
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const unreadNotes = notes.filter((n) => !n.read_at).length;
  const initial = (userName || clientName || "?").trim().charAt(0).toUpperCase();

  async function markAllRead() {
    setNotes((n) => n.map((x) => ({ ...x, read_at: x.read_at ?? new Date().toISOString() })));
    await fetch("/api/portal/notifications", { method: "POST" }).catch(() => {});
  }

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/portal/login");
    router.refresh();
  }

  function toggleCollapsed() {
    setCollapsed((c) => {
      try {
        localStorage.setItem("portal-collapsed", c ? "0" : "1");
      } catch {
        // Not persisted - fine.
      }
      return !c;
    });
  }

  const isActive = (href: string) => (href === "/portal" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className={cn("flex items-center gap-3 px-4 py-4", collapsed && "lg:justify-center lg:px-2")}>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-stone-900 text-sm font-bold text-white">
          {clientName.charAt(0).toUpperCase()}
        </span>
        <div className={cn("min-w-0", collapsed && "lg:hidden")}>
          <p className="truncate text-sm font-semibold text-stone-900">{clientName}</p>
          <p className="text-[11px] text-stone-400">Client portal</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {NAV.map((item) => {
          const active = isActive(item.href);
          const badge = item.badgeKey ? counts[item.badgeKey] : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-orange-50 text-orange-600" : "text-stone-600 hover:bg-stone-100",
                collapsed && "lg:justify-center lg:px-2"
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              <span className={cn("flex-1", collapsed && "lg:hidden")}>{item.label}</span>
              {badge > 0 && (
                <span className={cn("rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white", collapsed && "lg:hidden")}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={toggleCollapsed}
        className={cn(
          "hidden items-center gap-3 border-t border-stone-200/70 px-6 py-4 text-sm text-stone-500 hover:text-stone-800 lg:flex",
          collapsed && "justify-center px-2"
        )}
      >
        {collapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" /> : <PanelLeftClose className="h-[18px] w-[18px]" />}
        <span className={cn(collapsed && "hidden")}>Collapse</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F6] text-stone-900">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden border-r border-stone-200/70 bg-white transition-[width] lg:block",
          collapsed ? "w-[76px]" : "w-[272px]"
        )}
      >
        {sidebar}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-stone-900/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[280px] bg-white shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-full p-2 text-stone-500 hover:bg-stone-100"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className={cn("transition-[padding]", collapsed ? "lg:pl-[76px]" : "lg:pl-[272px]")}>
        <header className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-stone-200/70 bg-white/85 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="rounded-full p-2 text-stone-600 hover:bg-stone-100 lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <p className="text-sm text-stone-500">
              Welcome back, <span className="font-semibold text-stone-900">{userName.split(" ")[0]}</span>
            </p>
          </div>
          <div ref={popRef} className="flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() => {
                  setBellOpen((o) => !o);
                  setMenuOpen(false);
                }}
                className="relative rounded-full p-2 text-stone-600 hover:bg-stone-100"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadNotes > 0 && (
                  <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-orange-500 px-1 text-[9px] font-bold text-white">
                    {unreadNotes}
                  </span>
                )}
              </button>
              {bellOpen && (
                <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
                    <p className="text-sm font-semibold">Notifications</p>
                    {unreadNotes > 0 && (
                      <button onClick={markAllRead} className="text-xs font-medium text-orange-600 hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notes.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-stone-400">You&apos;re all caught up.</p>
                    ) : (
                      notes.map((n) => (
                        <Link
                          key={n.id}
                          href={n.href || "/portal"}
                          onClick={() => setBellOpen(false)}
                          className={cn("block border-b border-stone-50 px-4 py-3 hover:bg-stone-50", !n.read_at && "bg-orange-50/50")}
                        >
                          <p className="text-sm font-medium text-stone-900">{n.title}</p>
                          {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-stone-500">{n.body}</p>}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => {
                  setMenuOpen((o) => !o);
                  setBellOpen(false);
                }}
                className="flex items-center gap-1 rounded-full p-1 hover:bg-stone-100"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-orange-600 text-sm font-bold text-white">{initial}</span>
                <ChevronDown className="h-4 w-4 text-stone-400" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-stone-200 bg-white py-1 shadow-xl">
                  <Link href="/portal/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-stone-50">
                    Profile &amp; password
                  </Link>
                  <button onClick={signOut} className="block w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[980px] px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}

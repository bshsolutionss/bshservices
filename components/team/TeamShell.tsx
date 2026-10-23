"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, FileText, FolderKanban, Home, KanbanSquare, LogOut, Menu, Target, Users, UsersRound, Wallet, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/browser";
import type { TeamAccess } from "@/lib/team-access";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  show: boolean;
}

export default function TeamShell({ name, jobTitle, access, children }: { name: string; jobTitle: string | null; access: TeamAccess; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const nav: NavItem[] = [
    { href: "/team", label: "Dashboard", icon: Home, show: true },
    { href: "/team/tasks", label: "Tasks", icon: KanbanSquare, show: true },
    { href: "/team/projects", label: "My Projects", icon: FolderKanban, show: true },
    { href: "/team/payments", label: "Payments", icon: Wallet, show: true },
    { href: "/team/leads", label: "Leads", icon: Target, show: access.leads !== "none" },
    { href: "/team/clients", label: "Clients", icon: Users, show: access.clients !== "none" },
    { href: "/team/meetings", label: "Meetings", icon: CalendarDays, show: access.meetings !== "none" },
    { href: "/team/files", label: "Files", icon: FileText, show: access.files !== "none" },
    { href: "/team/people", label: "Team", icon: UsersRound, show: true },
  ].filter((i) => i.show);

  const isActive = (href: string) => (href === "/team" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/team/login");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <p className="text-lg font-bold tracking-tight text-stone-900">BSH Solutions</p>
        <p className="text-[11px] text-stone-400">Team member</p>
      </div>
      <div className="mx-4 mb-3 flex items-center gap-3 rounded-2xl border border-stone-200 p-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-stone-900 text-sm font-bold text-white">{name.charAt(0).toUpperCase()}</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-stone-900">{name}</p>
          <p className="truncate text-[11px] text-stone-400">{jobTitle ?? "Team member"}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-1">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", isActive(item.href) ? "bg-orange-50 text-orange-600" : "text-stone-600 hover:bg-stone-100")}>
            <item.icon className="h-[18px] w-[18px]" /> {item.label}
          </Link>
        ))}
      </nav>
      <button onClick={signOut} className="flex items-center gap-3 border-t border-stone-200/70 px-6 py-4 text-sm text-stone-500 hover:text-red-600">
        <LogOut className="h-[18px] w-[18px]" /> Sign out
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F6] text-stone-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[256px] border-r border-stone-200/70 bg-white lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-stone-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[270px] bg-white shadow-xl">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-3 rounded-full p-2 text-stone-500 hover:bg-stone-100" aria-label="Close menu">
              <X className="h-4 w-4" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}
      <div className="lg:pl-[256px]">
        <header className="sticky top-0 z-20 flex h-[56px] items-center border-b border-stone-200/70 bg-white/85 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} className="rounded-full p-2 text-stone-600 hover:bg-stone-100" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <p className="ml-2 text-sm font-semibold">BSH Solutions team</p>
        </header>
        <main className="mx-auto w-full max-w-[1040px] px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/settings/company", label: "Company" },
  { href: "/admin/settings/email", label: "Email" },
  { href: "/admin/settings/invoices", label: "Invoices" },
  { href: "/admin/settings/lists", label: "Lists" },
  { href: "/admin/settings/statuses", label: "Statuses" },
  { href: "/admin/settings/templates", label: "Message templates" },
  { href: "/admin/settings/exchange-rates", label: "Exchange rates" },
  { href: "/admin/settings/users", label: "Users & roles" },
];

export default function SettingsTabs() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-[#1A14A5]/10 bg-white p-1 shadow-sm">
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition",
              active ? "bg-[#1A14A5] text-white shadow-sm" : "text-[#231F20]/60 hover:bg-[#F4F7FE] hover:text-[#1A14A5]"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

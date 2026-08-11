import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/admin/SignOutButton";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belt-and-suspenders: proxy.ts already redirects unauthenticated /admin/*
  // requests, this is a second check in case that ever drifts.
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE]">
      <header className="bg-[#1A14A5] text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="font-extrabold tracking-tight">BSH Admin</span>
            <nav className="flex items-center gap-6 text-sm font-medium text-white/80">
              <Link href="/admin" className="hover:text-white transition">
                Dashboard
              </Link>
              <Link href="/admin/leads" className="hover:text-white transition">
                Leads
              </Link>
            </nav>
          </div>
          <SignOutButton />
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}

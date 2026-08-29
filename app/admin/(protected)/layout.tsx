import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";

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
      <AdminShell userEmail={user.email ?? null}>{children}</AdminShell>
    </div>
  );
}

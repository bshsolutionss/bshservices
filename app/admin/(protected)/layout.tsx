import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/session";
import AdminShell from "@/components/admin/AdminShell";
import StatusOverridesInit from "@/components/admin/StatusOverridesInit";
import { ensureStatusOverrides } from "@/lib/admin/status-overrides";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, statusOverrides] = await Promise.all([getAdminSession(), ensureStatusOverrides()]);

  // Belt-and-suspenders: proxy.ts already redirects unauthenticated /admin/*
  // requests, this is a second check in case that ever drifts.
  if (!user) {
    redirect("/admin/restricted?reason=norole");
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE]">
      <StatusOverridesInit rows={statusOverrides} />
      <AdminShell userEmail={user.email} role={user.role}>{children}</AdminShell>
    </div>
  );
}

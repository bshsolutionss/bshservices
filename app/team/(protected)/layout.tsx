import { redirect } from "next/navigation";
import TeamShell from "@/components/team/TeamShell";
import { getTeamSession } from "@/lib/team/session";
import { getAdminSession } from "@/lib/admin/session";

export const metadata = {
  title: "Team dashboard",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function TeamLayout({ children }: { children: React.ReactNode }) {
  const session = await getTeamSession();
  if (!session) {
    // Admins and managers who wander in belong in the admin panel; anyone else has no team access.
    redirect((await getAdminSession()) ? "/admin" : "/team/login?reason=noaccess");
  }
  if (session.mustChangePassword) redirect("/team/set-password");
  return (
    <TeamShell name={session.name} jobTitle={session.jobTitle} access={session.access}>
      {children}
    </TeamShell>
  );
}

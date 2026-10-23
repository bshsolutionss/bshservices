import { redirect } from "next/navigation";
import LoginForm from "@/components/portal/LoginForm";
import { getTeamSession } from "@/lib/team/session";

export const metadata = {
  title: "Team sign in",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function TeamLoginPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const { reason } = await searchParams;
  if (await getTeamSession()) redirect("/team");
  return (
    <LoginForm
      noAccess={reason === "noaccess"}
      redirectTo="/team"
      title="BSH Solutions team"
      subtitle="Sign in to your dashboard - tasks, projects and pay."
      noAccessText="This account isn't set up for the team dashboard. Ask an admin to add you."
      helpText="Forgot your password? Ask an admin to reset it - they'll send you a new temporary one."
    />
  );
}

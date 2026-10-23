import { redirect } from "next/navigation";
import SetPasswordForm from "@/components/team/SetPasswordForm";
import { getTeamSession } from "@/lib/team/session";

export const metadata = {
  title: "Set your password",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

/** Shown on a team member's first sign-in: the temporary password must be replaced before anything else opens. */
export default async function SetPasswordPage() {
  const session = await getTeamSession();
  if (!session) redirect("/team/login");
  if (!session.mustChangePassword) redirect("/team");
  return <SetPasswordForm name={session.name} />;
}

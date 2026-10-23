import { redirect } from "next/navigation";
import LoginForm from "@/components/portal/LoginForm";
import { getPortalSession } from "@/lib/portal/session";

export const metadata = {
  title: "Client portal sign in",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function PortalLoginPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const { reason } = await searchParams;
  if (await getPortalSession()) redirect("/portal");
  return <LoginForm noAccess={reason === "noaccess"} />;
}

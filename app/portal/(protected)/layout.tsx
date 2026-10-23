import { redirect } from "next/navigation";
import PortalShell from "@/components/portal/PortalShell";
import { getPortalSession } from "@/lib/portal/session";
import { getPortalCounts } from "@/lib/portal/data";

export const metadata = {
  title: "Client portal",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login?reason=noaccess");
  const counts = await getPortalCounts(session.clientId);
  return (
    <PortalShell clientName={session.clientName} userName={session.name} counts={counts}>
      {children}
    </PortalShell>
  );
}

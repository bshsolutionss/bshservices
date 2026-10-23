import { UserCircle } from "lucide-react";
import { getPortalSession } from "@/lib/portal/session";
import { PageHeader } from "@/components/portal/ui";
import ProfileForm from "@/components/portal/ProfileForm";

export default async function PortalProfilePage() {
  const session = (await getPortalSession())!;
  return (
    <div>
      <PageHeader icon={UserCircle} title="Profile" subtitle="Your name and password." />
      <ProfileForm email={session.email} initialName={session.name} />
    </div>
  );
}

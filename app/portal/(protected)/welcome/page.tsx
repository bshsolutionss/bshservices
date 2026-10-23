import { getPortalSession } from "@/lib/portal/session";
import { getPortalWelcome } from "@/lib/portal/welcome";
import WelcomeWizard from "@/components/portal/WelcomeWizard";

export default async function PortalWelcomePage() {
  const session = (await getPortalSession())!;
  const settings = await getPortalWelcome();
  return (
    <WelcomeWizard
      firstName={session.name.split(" ")[0]}
      clientName={session.clientName}
      settings={settings}
      initialChecked={session.onboarding.checked ?? []}
    />
  );
}

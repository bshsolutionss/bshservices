"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import InstallAppButton from "@/components/InstallAppButton";
import WhatsAppButton from "@/components/WhatsAppButton";
import ExitIntentOffer from "@/components/ExitIntentOffer";

/**
 * Wraps the public marketing Header/Footer around page content, except on
 * /admin/* routes — the admin panel renders its own shell (see
 * app/admin/layout.tsx) and shouldn't get the public nav/footer.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="overflow-x-hidden">{children}</main>
      <Footer />
      <InstallAppButton variant="floating" />
      <WhatsAppButton variant="floating" source="floating_button" />
      <ExitIntentOffer />
    </>
  );
}

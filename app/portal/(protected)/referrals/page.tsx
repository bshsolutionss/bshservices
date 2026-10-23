import { Gift } from "lucide-react";
import { getPortalSession } from "@/lib/portal/session";
import { getCompanySettings } from "@/lib/admin/company-settings";
import { PageHeader, SectionLabel } from "@/components/portal/ui";
import ReferralForm from "@/components/portal/ReferralForm";
import ReviewForm from "@/components/portal/ReviewForm";

export default async function PortalReferralsPage() {
  const [session, company] = await Promise.all([getPortalSession(), getCompanySettings()]);
  return (
    <div>
      <PageHeader icon={Gift} title="Referrals" subtitle="Know someone who needs our services? Introduce us." />
      <ReferralForm supportEmail={company.email} />
      <SectionLabel hint="A few words from you go a long way.">Share a testimonial</SectionLabel>
      <ReviewForm defaultName={session!.name} prompt="What would you tell someone thinking about working with us?" />
    </div>
  );
}

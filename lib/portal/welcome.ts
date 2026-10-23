import { createServiceRoleClient } from "@/lib/supabase/service";

/** Settings > Portal: what the welcome walkthrough tells new clients, and the checklist of things we need from them. */
export interface ChecklistItem {
  id: string;
  label: string;
  hint?: string;
}

export interface PortalWelcomeSettings {
  how_we_work: string;
  what_happens_next: string;
  communication: string;
  checklist: ChecklistItem[];
}

export const PORTAL_WELCOME_KEY = "portal_welcome";

export const DEFAULT_PORTAL_WELCOME: PortalWelcomeSettings = {
  how_we_work:
    "You get one place for everything: project progress, files, invoices and messages. We keep you updated as work moves forward, and ask for your approval before anything important goes live.",
  what_happens_next:
    "1. We review your brief and confirm scope and timeline.\n2. You share the items on your checklist so we can start.\n3. We build in stages and share each one for your approval.\n4. We launch, hand over everything, and stay on hand for support.",
  communication:
    "Message us anytime from the Messages tab - we reply during working hours and you'll get an email when we do. For anything formal (changes, sign-offs), use Requests so nothing gets lost.",
  checklist: [
    { id: "logo", label: "Your logo and brand colours", hint: "Any format is fine" },
    { id: "content", label: "Text and photos you'd like to use" },
    { id: "logins", label: "Logins we'll need (domain, hosting, social)", hint: "Share them securely in your portal" },
    { id: "contact", label: "One main contact person for approvals" },
  ],
};

export async function getPortalWelcome(): Promise<PortalWelcomeSettings> {
  try {
    const { data } = await createServiceRoleClient().from("app_settings").select("value").eq("key", PORTAL_WELCOME_KEY).maybeSingle();
    const stored = (data?.value ?? {}) as Partial<PortalWelcomeSettings>;
    return {
      how_we_work: stored.how_we_work || DEFAULT_PORTAL_WELCOME.how_we_work,
      what_happens_next: stored.what_happens_next || DEFAULT_PORTAL_WELCOME.what_happens_next,
      communication: stored.communication || DEFAULT_PORTAL_WELCOME.communication,
      checklist: Array.isArray(stored.checklist) && stored.checklist.length ? stored.checklist : DEFAULT_PORTAL_WELCOME.checklist,
    };
  } catch {
    return DEFAULT_PORTAL_WELCOME;
  }
}

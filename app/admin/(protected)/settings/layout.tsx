import SettingsTabs from "@/components/admin/settings/SettingsTabs";

/** Shared chrome for every settings screen, so they read as one section. */
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <SettingsTabs />
      {children}
    </div>
  );
}

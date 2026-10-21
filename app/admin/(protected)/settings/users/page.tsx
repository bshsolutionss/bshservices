import { createServiceRoleClient } from "@/lib/supabase/service";
import { getAdminSession } from "@/lib/admin/session";
import { listRoleRows } from "@/lib/admin/roles";
import { PageHeader } from "@/components/admin/ui";
import UsersManager from "@/components/admin/settings/UsersManager";

export const dynamic = "force-dynamic";

export default async function UsersSettingsPage() {
  const supabase = createServiceRoleClient();
  const [rows, session, { data: employees }] = await Promise.all([
    listRoleRows(),
    getAdminSession(),
    supabase.from("employees").select("id, name").eq("status", "active").order("name"),
  ]);
  return (
    <div className="space-y-6">
      <PageHeader title="Users & roles" subtitle="Control who can sign in and what each person can see and change." />
      <div className="max-w-3xl">
        <UsersManager
          users={rows}
          employees={(employees ?? []) as { id: string; name: string }[]}
          implicit={rows.length === 0}
          currentEmail={session?.email ?? null}
        />
      </div>
    </div>
  );
}

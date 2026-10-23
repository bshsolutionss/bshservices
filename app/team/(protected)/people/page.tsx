import { UsersRound } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { EmptyState, PageHeader, portalCard } from "@/components/portal/ui";

export default async function TeamPeoplePage() {
  // Names and job titles only - email, phone and pay stay private.
  const { data } = await createServiceRoleClient().from("employees").select("id, name, role, department").eq("status", "active").order("name");
  return (
    <div>
      <PageHeader icon={UsersRound} title="Team" subtitle="Who you're working with." />
      {(data ?? []).length === 0 ? (
        <EmptyState icon={UsersRound} title="No teammates yet" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {(data ?? []).map((e) => (
            <div key={e.id} className={`${portalCard} flex items-center gap-3 p-4`}>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">{e.name.charAt(0).toUpperCase()}</span>
              <div>
                <p className="font-semibold">{e.name}</p>
                <p className="text-xs text-stone-500">{[e.role, e.department].filter(Boolean).join(" · ") || "Team member"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

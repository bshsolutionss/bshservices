import { createServiceRoleClient } from "@/lib/supabase/service";
import type { Activity, ActivityEntityType } from "@/lib/activity";

interface ActivityTimelineProps {
  entityType: ActivityEntityType;
  entityId: string;
}

/** Server-rendered, reverse-chronological activity feed for one entity. */
export default async function ActivityTimeline({ entityType, entityId }: ActivityTimelineProps) {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("activities")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false })
    .limit(50);

  const activities = (data ?? []) as Activity[];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 p-6">
      <h2 className="font-bold text-[#231F20] mb-4">Activity</h2>
      {activities.length === 0 ? (
        <p className="text-sm text-[#231F20]/50">No activity yet.</p>
      ) : (
        <ol className="space-y-4">
          {activities.map((activity) => (
            <li key={activity.id} className="flex gap-3 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1A14A5] mt-1.5 shrink-0" />
              <div>
                <p className="text-[#231F20]">{activity.description}</p>
                <p className="text-xs text-[#231F20]/40 mt-0.5">
                  {new Date(activity.created_at).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

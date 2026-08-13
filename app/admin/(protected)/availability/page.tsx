import { createServiceRoleClient } from "@/lib/supabase/service";
import type { AvailabilityRule, AvailabilityBlock } from "@/lib/availability";
import AvailabilityManager from "@/components/admin/AvailabilityManager";

export const dynamic = "force-dynamic";

async function getAvailabilityData(): Promise<{
  rules: AvailabilityRule[];
  blocks: AvailabilityBlock[];
  unavailable: boolean;
}> {
  try {
    const supabase = createServiceRoleClient();
    const [{ data: rules, error: rulesError }, { data: blocks, error: blocksError }] = await Promise.all([
      supabase.from("availability_rules").select("*").order("day_of_week"),
      supabase
        .from("availability_blocks")
        .select("*")
        .gte("block_date", new Date().toISOString().slice(0, 10))
        .order("block_date"),
    ]);

    if (rulesError || blocksError) {
      console.error("[admin/availability] query failed:", rulesError || blocksError);
      return { rules: [], blocks: [], unavailable: true };
    }

    return { rules: (rules ?? []) as AvailabilityRule[], blocks: (blocks ?? []) as AvailabilityBlock[], unavailable: false };
  } catch (err) {
    console.error("[admin/availability] failed:", err);
    return { rules: [], blocks: [], unavailable: true };
  }
}

export default async function AdminAvailabilityPage() {
  const { rules, blocks, unavailable } = await getAvailabilityData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#231F20]">Availability</h1>
        <p className="text-[#231F20]/60 text-sm mt-1">Manage when visitors can book a free consultation.</p>
      </div>

      {unavailable ? (
        <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-6 text-amber-700 text-sm">
          Availability management is temporarily unavailable — the database migration for this feature may not
          have been run yet.
        </div>
      ) : (
        <AvailabilityManager initialRules={rules} initialBlocks={blocks} />
      )}
    </div>
  );
}

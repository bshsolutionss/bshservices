import { createServiceRoleClient } from "@/lib/supabase/service";
import { DEFAULT_OPTIONS, type AppOption, type OptionLite, type OptionListKey } from "@/lib/option-lists";

/** Active options for a list, in the order set in Settings. Falls back to the built-in defaults if the table is empty or missing. */
export async function getOptions(key: OptionListKey): Promise<OptionLite[]> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("app_options")
      .select("value, label, color")
      .eq("list_key", key)
      .eq("active", true)
      .order("sort_order")
      .order("label");
    if (error || !data || data.length === 0) return DEFAULT_OPTIONS[key];
    return data as OptionLite[];
  } catch {
    return DEFAULT_OPTIONS[key];
  }
}

/** Every option (including switched-off ones) - for the Settings manager. */
export async function getAllOptions(key: OptionListKey): Promise<AppOption[]> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("app_options")
    .select("id, list_key, value, label, color, sort_order, active")
    .eq("list_key", key)
    .order("sort_order")
    .order("label");
  return (data ?? []) as AppOption[];
}

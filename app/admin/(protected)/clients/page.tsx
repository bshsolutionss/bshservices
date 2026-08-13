import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { Client } from "@/lib/clients";
import NewClientInlineForm from "@/components/admin/NewClientInlineForm";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const clients = (data ?? []) as Client[];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#231F20]">Clients</h1>
          <p className="text-[#231F20]/60 text-sm mt-1">
            {clients.length} client{clients.length === 1 ? "" : "s"}
          </p>
        </div>
        <NewClientInlineForm />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1A14A5]/10 text-left text-[#231F20]/50">
              <th className="px-6 py-3 font-medium">Company</th>
              <th className="px-6 py-3 font-medium">Contact</th>
              <th className="px-6 py-3 font-medium">Industry</th>
              <th className="px-6 py-3 font-medium">Account Manager</th>
              <th className="px-6 py-3 font-medium">Since</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A14A5]/5">
            {clients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-[#231F20]/50">
                  No clients yet — they&apos;re created automatically when a lead is marked Won, or added manually above.
                </td>
              </tr>
            )}
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-[#F4F7FE] transition">
                <td className="px-6 py-4">
                  <Link href={`/admin/clients/${client.id}`} className="font-medium text-[#1A14A5] hover:underline">
                    {client.company_name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-[#231F20]/70">
                  <div>{client.contact_name || client.contact_email}</div>
                  <div className="text-xs text-[#231F20]/50">{client.contact_email}</div>
                </td>
                <td className="px-6 py-4 text-[#231F20]/70">{client.industry || "—"}</td>
                <td className="px-6 py-4 text-[#231F20]/70">{client.account_manager || "—"}</td>
                <td className="px-6 py-4 text-[#231F20]/50 text-xs whitespace-nowrap">
                  {new Date(client.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

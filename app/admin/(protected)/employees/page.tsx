import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { EMPLOYEE_STATUS_LABELS, EMPLOYEE_STATUS_COLORS, type Employee, type EmployeeStatus } from "@/lib/employees";
import NewEmployeeInlineForm from "@/components/admin/NewEmployeeInlineForm";

export const dynamic = "force-dynamic";

export default async function AdminEmployeesPage() {
  const supabase = createServiceRoleClient();
  const { data } = await supabase.from("employees").select("*").order("name");

  const employees = (data ?? []) as Employee[];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#231F20]">Employees</h1>
          <p className="text-[#231F20]/60 text-sm mt-1">
            {employees.length} employee{employees.length === 1 ? "" : "s"}
          </p>
        </div>
        <NewEmployeeInlineForm />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#1A14A5]/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1A14A5]/10 text-left text-[#231F20]/50">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium">Department</th>
              <th className="px-6 py-3 font-medium">Contact</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A14A5]/5">
            {employees.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-[#231F20]/50">
                  No employees added yet.
                </td>
              </tr>
            )}
            {employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-[#F4F7FE] transition">
                <td className="px-6 py-4">
                  <Link href={`/admin/employees/${employee.id}`} className="font-medium text-[#1A14A5] hover:underline">
                    {employee.name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-[#231F20]/70">{employee.role || "—"}</td>
                <td className="px-6 py-4 text-[#231F20]/70">{employee.department || "—"}</td>
                <td className="px-6 py-4 text-[#231F20]/70">
                  <div>{employee.email || "—"}</div>
                  {employee.phone && <div className="text-xs text-[#231F20]/50">{employee.phone}</div>}
                </td>
                <td className="px-6 py-4">
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{
                      background: EMPLOYEE_STATUS_COLORS[employee.status as EmployeeStatus].bg,
                      color: EMPLOYEE_STATUS_COLORS[employee.status as EmployeeStatus].text,
                    }}
                  >
                    {EMPLOYEE_STATUS_LABELS[employee.status as EmployeeStatus]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

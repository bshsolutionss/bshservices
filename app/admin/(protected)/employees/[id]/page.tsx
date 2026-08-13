import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { Employee, EmployeeStatus } from "@/lib/employees";
import EmployeeEditControl from "@/components/admin/EmployeeEditControl";

export const dynamic = "force-dynamic";

export default async function AdminEmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceRoleClient();

  const { data: employee } = await supabase.from("employees").select("*").eq("id", id).single<Employee>();

  if (!employee) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/employees" className="text-sm text-[#1A14A5] hover:underline">
          ← Back to Employees
        </Link>
        <h1 className="text-2xl font-extrabold text-[#231F20] mt-2">{employee.name}</h1>
        {employee.role && <p className="text-[#231F20]/60 text-sm">{employee.role}</p>}
      </div>

      <div className="max-w-xl">
        <EmployeeEditControl
          employeeId={employee.id}
          initial={{
            name: employee.name,
            email: employee.email,
            phone: employee.phone,
            role: employee.role,
            department: employee.department,
            status: employee.status as EmployeeStatus,
            hire_date: employee.hire_date,
            notes: employee.notes,
          }}
        />
      </div>
    </div>
  );
}

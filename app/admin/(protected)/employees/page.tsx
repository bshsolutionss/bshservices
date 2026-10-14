import { Contact, UserCheck, UserMinus } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { Employee } from "@/lib/employees";
import { PageHeader, StatCard } from "@/components/admin/ui";
import EmployeeFormModal from "@/components/admin/employees/EmployeeFormModal";
import EmployeesTable from "@/components/admin/employees/EmployeesTable";

export const dynamic = "force-dynamic";

export default async function AdminEmployeesPage() {
  const supabase = createServiceRoleClient();
  const { data } = await supabase.from("employees").select("*").order("name");

  const employees = (data ?? []) as Employee[];
  const active = employees.filter((e) => e.status === "active").length;
  const departments = new Set(employees.map((e) => e.department).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        subtitle={`${employees.length} on record · ${active} active`}
        actions={<EmployeeFormModal />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Active" value={active} description="Currently with the company" icon={UserCheck} iconBg="#0d9488" />
        <StatCard
          label="Inactive"
          value={employees.length - active}
          description="Left or on hold"
          icon={UserMinus}
          iconBg="#6B7280"
        />
        <StatCard label="Departments" value={departments} description="Distinct departments" icon={Contact} iconBg="#7c3aed" />
      </div>

      <EmployeesTable employees={employees} />
    </div>
  );
}

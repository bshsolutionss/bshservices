import { Briefcase, Laptop, UserCheck, UserMinus } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { Employee } from "@/lib/employees";
import { PageHeader, StatCard } from "@/components/admin/ui";
import EmployeeFormModal from "@/components/admin/employees/EmployeeFormModal";
import TeamMemberModal from "@/components/admin/team/TeamMemberModal";
import EmployeesTable from "@/components/admin/employees/EmployeesTable";
import { WriteGate } from "@/components/admin/RoleContext";

export const dynamic = "force-dynamic";

export default async function AdminEmployeesPage() {
  const supabase = createServiceRoleClient();
  const { data } = await supabase.from("employees").select("*").order("name");

  const employees = (data ?? []) as Employee[];
  const active = employees.filter((e) => e.status === "active");
  const freelancers = active.filter((e) => e.employment_type === "freelance").length;
  const staff = active.length - freelancers;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        subtitle={`Your staff and freelancers - how they are paid and what they are working on. ${employees.length} on record · ${active.length} active.`}
        actions={
          <WriteGate module="team">
            <span className="flex flex-wrap items-center gap-2">
              <EmployeeFormModal variant="outline" defaultType="freelance" label="Add freelancer" />
              <EmployeeFormModal variant="outline" label="Add employee" />
              <TeamMemberModal label="Add team member" />
            </span>
          </WriteGate>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Staff (job)" value={staff} description="Active salaried team" icon={Briefcase} iconBg="#1A14A5" />
        <StatCard label="Freelancers" value={freelancers} description="Active, paid per project/hour" icon={Laptop} iconBg="#ea580c" />
        <StatCard label="Active" value={active.length} description="Currently working with us" icon={UserCheck} iconBg="#0d9488" />
        <StatCard
          label="Inactive"
          value={employees.length - active.length}
          description="Left or on hold"
          icon={UserMinus}
          iconBg="#6B7280"
        />
      </div>

      <EmployeesTable employees={employees} emptyTitle="No team members yet" emptyAction={<EmployeeFormModal label="Add first team member" />} />
    </div>
  );
}

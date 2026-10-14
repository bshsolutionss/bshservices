import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckSquare, Mail } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  EMPLOYEE_STATUS_COLORS,
  EMPLOYEE_STATUS_LABELS,
  EMPLOYMENT_TYPE_COLORS,
  EMPLOYMENT_TYPE_LABELS,
  PAY_BASIS_LABELS,
  type Employee,
} from "@/lib/employees";
import { TASK_STATUS_COLORS, TASK_STATUS_LABELS, type Task } from "@/lib/tasks";
import { formatDate, formatMoney } from "@/lib/invoices";
import { Badge, EmptyState, PageHeader, SectionCard } from "@/components/admin/ui";
import EmployeeFormModal from "@/components/admin/employees/EmployeeFormModal";
import DeleteEmployeeButton from "@/components/admin/DeleteEmployeeButton";

export const dynamic = "force-dynamic";

export default async function AdminEmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceRoleClient();

  const [{ data: employee }, { data: tasksData }] = await Promise.all([
    supabase.from("employees").select("*").eq("id", id).single<Employee>(),
    supabase
      .from("tasks")
      .select("id, title, status, due_date, project_id, projects(name)")
      .eq("assignee_id", id)
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(100),
  ]);

  if (!employee) notFound();

  type TaskRowData = Pick<Task, "id" | "title" | "status" | "due_date" | "project_id"> & {
    projects: { name: string } | { name: string }[] | null;
  };
  const tasks = (tasksData ?? []) as unknown as TaskRowData[];
  const open = tasks.filter((t) => t.status !== "completed").length;

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/admin/employees"
        backLabel="Back to Team"
        title={employee.name}
        subtitle={employee.role ?? undefined}
        actions={<EmployeeFormModal employee={employee} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="Assigned tasks" subtitle={`${open} open · ${tasks.length} total`}>
            {tasks.length === 0 ? (
              <EmptyState
                icon={CheckSquare}
                title="No tasks assigned"
                description="Assign a task from a project or the Tasks page and it shows up here."
              />
            ) : (
              <ul className="divide-y divide-[#1A14A5]/5">
                {tasks.map((task) => {
                  const project = Array.isArray(task.projects) ? task.projects[0] : task.projects;
                  return (
                    <li key={task.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[#231F20]">{task.title}</p>
                        <p className="text-xs text-[#231F20]/50">
                          <Link href={`/admin/projects/${task.project_id}`} className="hover:text-[#1A14A5] hover:underline">
                            {project?.name ?? "Project"}
                          </Link>
                          {task.due_date ? ` · Due ${formatDate(task.due_date)}` : ""}
                        </p>
                      </div>
                      <Badge label={TASK_STATUS_LABELS[task.status]} colors={TASK_STATUS_COLORS[task.status]} />
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Profile">
            <dl className="space-y-2.5 text-sm">
              <Row
                label="Type"
                value={
                  <Badge
                    label={EMPLOYMENT_TYPE_LABELS[employee.employment_type] ?? "Job (staff)"}
                    colors={EMPLOYMENT_TYPE_COLORS[employee.employment_type] ?? EMPLOYMENT_TYPE_COLORS.job}
                  />
                }
              />
              <Row
                label="Status"
                value={<Badge label={EMPLOYEE_STATUS_LABELS[employee.status]} colors={EMPLOYEE_STATUS_COLORS[employee.status]} />}
              />
              <Row
                label="Pay"
                value={
                  employee.pay_amount != null
                    ? `${formatMoney(employee.pay_amount, employee.pay_currency)} · ${PAY_BASIS_LABELS[employee.pay_basis] ?? ""}`
                    : "Not set"
                }
              />
              <Row label="Department" value={employee.department || "—"} />
              <Row label="Since" value={formatDate(employee.hire_date)} />
              <Row
                label="Email"
                value={
                  employee.email ? (
                    <a href={`mailto:${employee.email}`} className="inline-flex items-center gap-1 text-[#1A14A5] hover:underline">
                      <Mail className="h-3.5 w-3.5" />
                      {employee.email}
                    </a>
                  ) : (
                    <span className="text-amber-600">None - no task emails</span>
                  )
                }
              />
              <Row label="Phone" value={employee.phone || "—"} />
            </dl>
            {employee.notes && (
              <p className="mt-4 whitespace-pre-wrap rounded-xl bg-[#F4F7FE] p-3 text-sm text-[#231F20]/70">{employee.notes}</p>
            )}
          </SectionCard>
          <DeleteEmployeeButton employeeId={employee.id} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-[#231F20]/55">{label}</dt>
      <dd className="text-right font-semibold text-[#231F20]">{value}</dd>
    </div>
  );
}

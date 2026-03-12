import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEntity } from '@/contexts/EntityContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/use-permissions';
import { MOCK_EMPLOYEES, getNationalityFlag } from '@/lib/mockData';
import { Search, Plus, Upload, Users, Download, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { CSVImportDialog } from '@/components/employees/CSVImportDialog';
import { EmployeeDrawer } from '@/components/employees/EmployeeDrawer';
import { EmployeeFormDialog } from '@/components/employees/EmployeeFormDialog';
import { InlineEditableRow } from '@/components/employees/InlineEditableRow';
import { EmptyState, TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { toast } from 'sonner';
import { exportEmployeesCSV } from '@/lib/export-utils';
import { useDeleteEmployee, useUpdateEmployee } from '@/hooks/use-supabase-data';
import type { Employee } from '@/types/database';

export default function Employees() {
  const { selectedEntity, employeesByEntity, loading: entityLoading, refreshEntityData } = useEntity();
  const { isDemoMode } = useAuth();
  const { canEditEmployees, canDeleteEmployees } = usePermissions();

  // Use live data or mock data based on mode
  const liveEmployees = employeesByEntity[selectedEntity.id] || [];
  const mockEmployees = MOCK_EMPLOYEES[selectedEntity.id] || [];
  const employees: Employee[] = isDemoMode
    ? mockEmployees
    : liveEmployees.map(e => ({
        ...e,
        contract_type: e.contract_type ?? 'full_time',
        counts_toward_quota: e.counts_toward_quota ?? true,
        is_national: e.is_national ?? false,
        department: e.department ?? undefined,
        job_title: e.job_title ?? undefined,
        salary_band: e.salary_band ?? undefined,
        start_date: e.start_date ?? undefined,
        end_date: e.end_date ?? undefined,
      } as Employee));

  const [search, setSearch] = useState('');
  const [natFilter, setNatFilter] = useState<'all' | 'nationals' | 'expats'>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [csvOpen, setCsvOpen] = useState(false);
  const [drawerEmployee, setDrawerEmployee] = useState<Employee | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);

  const deleteEmployee = useDeleteEmployee();
  const updateEmployee = useUpdateEmployee();

  const handleInlineSave = async (id: string, updates: Partial<Employee>) => {
    if (isDemoMode) {
      toast.success('Employee updated');
      return;
    }
    try {
      await updateEmployee.mutateAsync({ id, ...updates } as any);
      toast.success('Employee updated');
      refreshEntityData();
    } catch {
      toast.error('Failed to update employee');
    }
  };

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

  const filtered = employees.filter((e) => {
    const matchesSearch = e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.department?.toLowerCase().includes(search.toLowerCase()) ||
      e.nationality.toLowerCase().includes(search.toLowerCase());
    const matchesNat = natFilter === 'all' || (natFilter === 'nationals' ? e.is_national : !e.is_national);
    const matchesDept = deptFilter === 'all' || e.department === deptFilter;
    return matchesSearch && matchesNat && matchesDept;
  });

  const handleAddEmployee = () => {
    setEditEmployee(null);
    setFormOpen(true);
  };

  const handleEditFromDrawer = (emp: Employee) => {
    setDrawerEmployee(null);
    setEditEmployee(emp);
    setFormOpen(true);
  };

  const handleDelete = async (emp: Employee) => {
    if (isDemoMode) {
      toast.success(`${emp.full_name} has been removed`);
      return;
    }
    try {
      await deleteEmployee.mutateAsync(emp.id);
      toast.success(`${emp.full_name} has been removed`);
      refreshEntityData();
    } catch {
      toast.error('Failed to delete employee');
    }
  };

  const isLoading = !isDemoMode && entityLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-sora font-bold text-2xl">
          Employees <span className="text-muted-foreground text-lg">({employees.length})</span>
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportEmployeesCSV(employees, selectedEntity.name)}>
            <Download className="w-4 h-4 mr-2" />Export CSV
          </Button>
          {canEditEmployees && (
            <>
              <Button variant="outline" onClick={() => setCsvOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />Import CSV
              </Button>
              <Button onClick={handleAddEmployee}>
                <Plus className="w-4 h-4 mr-2" />Add Employee
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, department, nationality..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={natFilter} onValueChange={(v) => setNatFilter(v as 'all' | 'nationals' | 'expats')}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Nationalities</SelectItem>
            <SelectItem value="nationals">Nationals Only</SelectItem>
            <SelectItem value="expats">Expats Only</SelectItem>
          </SelectContent>
        </Select>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(d => <SelectItem key={d} value={d!}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Card className="shadow-card">
          <CardContent className="p-4">
            <TableSkeleton rows={8} />
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No employees found"
          description={employees.length === 0 ? "Import a CSV or add employees manually to get started." : "No employees match your current filters."}
          action={employees.length === 0 ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCsvOpen(true)}>Import CSV</Button>
              <Button onClick={handleAddEmployee}>Add Employee</Button>
            </div>
          ) : undefined}
        />
      ) : (
        <Card className="shadow-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Nationality</th>
                    <th className="text-left p-3 font-medium">Role</th>
                    <th className="text-left p-3 font-medium">Department</th>
                    <th className="text-left p-3 font-medium">Contract</th>
                    <th className="text-center p-3 font-medium">Quota</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((emp) => (
                    <InlineEditableRow
                      key={emp.id}
                      employee={emp}
                      onSave={handleInlineSave}
                      onDelete={handleDelete}
                      onClick={setDrawerEmployee}
                      canEdit={canEditEmployees}
                      canDelete={canDeleteEmployees}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <CSVImportDialog open={csvOpen} onClose={() => setCsvOpen(false)} onImport={(data) => { toast.success(`${data.length} employees imported`); refreshEntityData(); }} />
      <EmployeeDrawer employee={drawerEmployee} open={!!drawerEmployee} onClose={() => setDrawerEmployee(null)} onEdit={handleEditFromDrawer} />
      <EmployeeFormDialog key={editEmployee?.id || 'new'} open={formOpen} onClose={() => { setFormOpen(false); refreshEntityData(); }} employee={editEmployee} onSave={() => { refreshEntityData(); }} />
    </div>
  );
}

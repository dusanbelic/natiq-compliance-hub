import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEntity } from '@/contexts/EntityContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/use-permissions';
import { MOCK_EMPLOYEES } from '@/lib/mockData';
import { Plus, Upload, Users, Download, Trash2, X } from 'lucide-react';
import { CSVImportDialog } from '@/components/employees/CSVImportDialog';
import { EmployeeDrawer } from '@/components/employees/EmployeeDrawer';
import { EmployeeFormDialog } from '@/components/employees/EmployeeFormDialog';
import { EmployeeFilters } from '@/components/employees/EmployeeFilters';
import { EmployeeTable, type SortKey, type SortDir } from '@/components/employees/EmployeeTable';
import { EmployeePagination } from '@/components/employees/EmployeePagination';
import { EmptyState, TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { exportEmployeesCSV } from '@/lib/export-utils';
import { useDeleteEmployee, useUpdateEmployee, useCompany, useDepartments, useSalaryBands } from '@/hooks/use-supabase-data';
import { SALARY_BANDS } from '@/lib/mockData';
import type { Employee } from '@/types/database';

export default function Employees() {
  const { selectedEntity, employeesByEntity, loading: entityLoading, refreshEntityData } = useEntity();
  const { isDemoMode } = useAuth();
  const { canEditEmployees, canDeleteEmployees } = usePermissions();

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const resetPage = () => setCurrentPage(1);

  const deleteEmployee = useDeleteEmployee();
  const updateEmployee = useUpdateEmployee();

  const handleInlineSave = async (id: string, updates: Partial<Employee>) => {
    if (isDemoMode) { toast.success('Employee updated'); return; }
    try {
      await updateEmployee.mutateAsync({ id, ...updates } as any);
      toast.success('Employee updated');
      refreshEntityData();
    } catch { toast.error('Failed to update employee'); }
  };

  const handleDelete = async (emp: Employee) => {
    if (isDemoMode) { toast.success(`${emp.full_name} has been removed`); return; }
    try {
      await deleteEmployee.mutateAsync(emp.id);
      toast.success(`${emp.full_name} has been removed`);
      refreshEntityData();
    } catch { toast.error('Failed to delete employee'); }
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (isDemoMode) {
      toast.success(`${count} employee${count > 1 ? 's' : ''} removed`);
      setSelectedIds(new Set());
      return;
    }
    try {
      await Promise.all(Array.from(selectedIds).map(id => deleteEmployee.mutateAsync(id)));
      toast.success(`${count} employee${count > 1 ? 's' : ''} removed`);
      setSelectedIds(new Set());
      refreshEntityData();
    } catch { toast.error('Failed to delete some employees'); }
  };

  const handleBulkExport = () => {
    const selected = employees.filter(e => selectedIds.has(e.id));
    exportEmployeesCSV(selected, selectedEntity.name);
    toast.success(`Exported ${selected.length} employee${selected.length > 1 ? 's' : ''}`);
  };

  const { data: company } = useCompany();
  const { data: dbDepartments } = useDepartments(company?.id ?? '');
  const departments = isDemoMode
    ? [...new Set(employees.map(e => e.department).filter(Boolean))] as string[]
    : (dbDepartments ?? []).map(d => d.name);

  const { data: dbSalaryBands } = useSalaryBands(company?.id ?? '');
  const salaryBands = isDemoMode
    ? SALARY_BANDS
    : (dbSalaryBands ?? []).map(b => b.name);

  const filtered = useMemo(() => {
    const list = employees.filter((e) => {
      const matchesSearch = e.full_name.toLowerCase().includes(search.toLowerCase()) ||
        e.department?.toLowerCase().includes(search.toLowerCase()) ||
        e.nationality.toLowerCase().includes(search.toLowerCase());
      const matchesNat = natFilter === 'all' || (natFilter === 'nationals' ? e.is_national : !e.is_national);
      const matchesDept = deptFilter === 'all' || e.department === deptFilter;
      return matchesSearch && matchesNat && matchesDept;
    });
    if (sortKey) {
      list.sort((a, b) => {
        const aVal = a[sortKey] ?? '';
        const bVal = b[sortKey] ?? '';
        if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
          return sortDir === 'asc' ? (aVal === bVal ? 0 : aVal ? -1 : 1) : (aVal === bVal ? 0 : aVal ? 1 : -1);
        }
        return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : -String(aVal).localeCompare(String(bVal));
      });
    }
    return list;
  }, [employees, search, natFilter, deptFilter, sortKey, sortDir]);

  const allFilteredIds = useMemo(() => filtered.map(e => e.id), [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleAddEmployee = () => { setEditEmployee(null); setFormOpen(true); };
  const handleEditFromDrawer = (emp: Employee) => { setDrawerEmployee(null); setEditEmployee(emp); setFormOpen(true); };

  const isLoading = !isDemoMode && entityLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-sora font-bold text-2xl">
          Employees <span className="text-muted-foreground text-lg">({employees.length})</span>
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => exportEmployeesCSV(employees, selectedEntity.name)}>
            <Download className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Export CSV</span>
          </Button>
          {canEditEmployees && (
            <>
              <Button variant="outline" size="sm" onClick={() => setCsvOpen(true)}>
                <Upload className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Import CSV</span>
              </Button>
              <Button size="sm" onClick={handleAddEmployee}>
                <Plus className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Add Employee</span>
              </Button>
            </>
          )}
        </div>
      </div>

      <EmployeeFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); resetPage(); }}
        natFilter={natFilter}
        onNatFilterChange={(v) => { setNatFilter(v); resetPage(); }}
        deptFilter={deptFilter}
        onDeptFilterChange={(v) => { setDeptFilter(v); resetPage(); }}
        departments={departments}
      />

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <div className="h-4 w-px bg-border" />
          <Button variant="outline" size="sm" onClick={handleBulkExport}>
            <Download className="w-3.5 h-3.5 mr-1.5" />Export Selected
          </Button>
          {canDeleteEmployees && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />Delete Selected
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {selectedIds.size} Employees</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {selectedIds.size} employee{selectedIds.size > 1 ? 's' : ''}. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground">
                    Delete {selectedIds.size}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button variant="ghost" size="sm" className="ml-auto h-7 w-7 p-0" onClick={() => setSelectedIds(new Set())}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {isLoading ? (
        <Card className="shadow-card"><CardContent className="p-4"><TableSkeleton rows={8} /></CardContent></Card>
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
             <EmployeeTable
              rows={paginatedRows}
              sortKey={sortKey}
              sortDir={sortDir}
              onToggleSort={toggleSort}
              onInlineSave={handleInlineSave}
              onDelete={handleDelete}
              onClick={setDrawerEmployee}
              canEdit={canEditEmployees}
              canDelete={canDeleteEmployees}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              allFilteredIds={allFilteredIds}
              departments={departments}
            />
            <EmployeePagination
              totalItems={filtered.length}
              pageSize={pageSize}
              currentPage={safePage}
              onPageChange={setCurrentPage}
              onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
            />
          </CardContent>
        </Card>
      )}

      <CSVImportDialog open={csvOpen} onClose={() => setCsvOpen(false)} onImport={(data) => { toast.success(`${data.length} employees imported`); refreshEntityData(); }} />
      <EmployeeDrawer employee={drawerEmployee} open={!!drawerEmployee} onClose={() => setDrawerEmployee(null)} onEdit={handleEditFromDrawer} />
      <EmployeeFormDialog key={editEmployee?.id || 'new'} open={formOpen} onClose={() => { setFormOpen(false); refreshEntityData(); }} employee={editEmployee} onSave={() => { refreshEntityData(); }} departments={departments} salaryBands={salaryBands} />
    </div>
  );
}

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEntity } from '@/contexts/EntityContext';
import { MOCK_EMPLOYEES, getNationalityFlag } from '@/lib/mockData';
import { Search, Plus, Upload, Check, X, Trash2, Users, Download } from 'lucide-react';
import { CSVImportDialog } from '@/components/employees/CSVImportDialog';
import { EmployeeDrawer } from '@/components/employees/EmployeeDrawer';
import { EmployeeFormDialog } from '@/components/employees/EmployeeFormDialog';
import { EmptyState } from '@/components/ui/LoadingSkeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { exportEmployeesCSV } from '@/lib/export-utils';
import type { Employee } from '@/types/database';

export default function Employees() {
  const { selectedEntity } = useEntity();
  const employees = MOCK_EMPLOYEES[selectedEntity.id] || [];
  const [search, setSearch] = useState('');
  const [natFilter, setNatFilter] = useState<'all' | 'nationals' | 'expats'>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [csvOpen, setCsvOpen] = useState(false);
  const [drawerEmployee, setDrawerEmployee] = useState<Employee | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);

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

  const handleDelete = (emp: Employee) => {
    toast.success(`${emp.full_name} has been removed`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-sora font-bold text-2xl">
          Employees <span className="text-muted-foreground text-lg">({employees.length})</span>
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCsvOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />Import CSV
          </Button>
          <Button onClick={handleAddEmployee}>
            <Plus className="w-4 h-4 mr-2" />Add Employee
          </Button>
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

      {filtered.length === 0 ? (
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
                    <tr
                      key={emp.id}
                      className="border-b hover:bg-muted/30 cursor-pointer"
                      onClick={() => setDrawerEmployee(emp)}
                    >
                      <td className="p-3 font-medium">{emp.full_name}</td>
                      <td className="p-3">
                        <span className="flex items-center gap-2">
                          {getNationalityFlag(emp.nationality)} {emp.nationality}
                          {emp.is_national && <span className="text-xs px-1.5 py-0.5 rounded bg-teal-light text-teal font-medium">NATIONAL</span>}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">{emp.job_title}</td>
                      <td className="p-3 text-muted-foreground">{emp.department}</td>
                      <td className="p-3 text-muted-foreground capitalize">{emp.contract_type.replace('_', ' ')}</td>
                      <td className="p-3 text-center">
                        {emp.counts_toward_quota ? <Check className="w-4 h-4 text-status-green mx-auto" /> : <X className="w-4 h-4 text-muted-foreground mx-auto" />}
                      </td>
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Employee</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete <strong>{emp.full_name}</strong>. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(emp)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <CSVImportDialog open={csvOpen} onClose={() => setCsvOpen(false)} onImport={(data) => toast.success(`${data.length} employees imported`)} />
      <EmployeeDrawer employee={drawerEmployee} open={!!drawerEmployee} onClose={() => setDrawerEmployee(null)} onEdit={handleEditFromDrawer} />
      <EmployeeFormDialog open={formOpen} onClose={() => setFormOpen(false)} employee={editEmployee} onSave={() => {}} />
    </div>
  );
}

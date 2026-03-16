import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useDepartments, useAddDepartment, useUpdateDepartment, useDeleteDepartment } from '@/hooks/use-supabase-data';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/hooks/use-supabase-data';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function DepartmentManager({ scrollRef }: { scrollRef?: React.RefObject<HTMLDivElement> }) {
  const { isDemoMode } = useAuth();
  const { data: company } = useCompany();
  const companyId = company?.id ?? '';

  const { data: departments, isLoading } = useDepartments(companyId);
  const addDept = useAddDepartment();
  const updateDept = useUpdateDepartment();
  const deleteDept = useDeleteDepartment();

  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Demo departments
  const demoDepartments = [
    { id: '1', name: 'Engineering', company_id: '', created_at: '' },
    { id: '2', name: 'Finance', company_id: '', created_at: '' },
    { id: '3', name: 'Human Resources', company_id: '', created_at: '' },
    { id: '4', name: 'Operations', company_id: '', created_at: '' },
  ];

  const displayDepartments = isDemoMode ? demoDepartments : (departments ?? []);

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (isDemoMode) {
      toast.info('Department added (demo mode)');
      setNewName('');
      setAdding(false);
      return;
    }
    try {
      await addDept.mutateAsync({ name: trimmed, company_id: companyId });
      toast.success(`"${trimmed}" department added`);
      setNewName('');
      setAdding(false);
    } catch (err: any) {
      if (err.message?.includes('duplicate')) {
        toast.error('A department with that name already exists');
      } else {
        toast.error(err.message ?? 'Failed to add department');
      }
    }
  };

  const handleUpdate = async (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) return;
    if (isDemoMode) {
      toast.info('Department updated (demo mode)');
      setEditingId(null);
      return;
    }
    try {
      await updateDept.mutateAsync({ id, name: trimmed });
      toast.success('Department renamed');
      setEditingId(null);
    } catch (err: any) {
      if (err.message?.includes('duplicate')) {
        toast.error('A department with that name already exists');
      } else {
        toast.error(err.message ?? 'Failed to update');
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (isDemoMode) {
      toast.info('Department deleted (demo mode)');
      return;
    }
    try {
      await deleteDept.mutateAsync(id);
      toast.success(`"${name}" department removed`);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to delete');
    }
  };

  return (
    <Card ref={scrollRef} className="shadow-card" id="departments">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Departments</CardTitle>
        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="w-4 h-4 mr-1" />Add Department
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-1">
        {/* Add new row */}
        {adding && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Input
              placeholder="Department name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              autoFocus
              className="h-8"
            />
            <Button size="sm" variant="ghost" onClick={handleAdd} disabled={!newName.trim()}>
              <Check className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setNewName(''); }}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Loading */}
        {isLoading && !isDemoMode ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : displayDepartments.length === 0 && !adding ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No departments defined yet. Add one to categorize your employees.
          </p>
        ) : (
          displayDepartments.map((dept) => (
            <div key={dept.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 group">
              {editingId === dept.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdate(dept.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    autoFocus
                    className="h-8"
                  />
                  <Button size="sm" variant="ghost" onClick={() => handleUpdate(dept.id)} disabled={!editName.trim()}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="text-sm font-medium">{dept.name}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setEditingId(dept.id); setEditName(dept.name); }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Department</AlertDialogTitle>
                          <AlertDialogDescription>
                            Delete "<strong>{dept.name}</strong>"? Existing employees in this department will keep their current assignment.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(dept.id, dept.name)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useSalaryBands, useAddSalaryBand, useUpdateSalaryBand, useDeleteSalaryBand } from '@/hooks/use-supabase-data';
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
import { SALARY_BANDS } from '@/lib/mockData';

export function SalaryBandManager() {
  const { isDemoMode } = useAuth();
  const { data: company } = useCompany();
  const companyId = company?.id ?? '';

  const { data: salaryBands, isLoading } = useSalaryBands(companyId);
  const addBand = useAddSalaryBand();
  const updateBand = useUpdateSalaryBand();
  const deleteBand = useDeleteSalaryBand();

  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const demoBands = SALARY_BANDS.map((name, i) => ({ id: String(i + 1), name, company_id: '', created_at: '' }));
  const displayBands = isDemoMode ? demoBands : (salaryBands ?? []);

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (isDemoMode) {
      toast.info('Salary band added (demo mode)');
      setNewName('');
      setAdding(false);
      return;
    }
    try {
      await addBand.mutateAsync({ name: trimmed, company_id: companyId });
      toast.success(`"${trimmed}" salary band added`);
      setNewName('');
      setAdding(false);
    } catch (err: any) {
      if (err.message?.includes('duplicate')) {
        toast.error('A salary band with that name already exists');
      } else {
        toast.error(err.message ?? 'Failed to add salary band');
      }
    }
  };

  const handleUpdate = async (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) return;
    if (isDemoMode) {
      toast.info('Salary band updated (demo mode)');
      setEditingId(null);
      return;
    }
    try {
      await updateBand.mutateAsync({ id, name: trimmed });
      toast.success('Salary band renamed');
      setEditingId(null);
    } catch (err: any) {
      if (err.message?.includes('duplicate')) {
        toast.error('A salary band with that name already exists');
      } else {
        toast.error(err.message ?? 'Failed to update');
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (isDemoMode) {
      toast.info('Salary band deleted (demo mode)');
      return;
    }
    try {
      await deleteBand.mutateAsync(id);
      toast.success(`"${name}" salary band removed`);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to delete');
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Salary Bands</CardTitle>
        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="w-4 h-4 mr-1" />Add Salary Band
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-1">
        {adding && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Input
              placeholder="Salary band name"
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

        {isLoading && !isDemoMode ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : displayBands.length === 0 && !adding ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No salary bands defined yet. Add one to categorize employee compensation levels.
          </p>
        ) : (
          displayBands.map((band) => (
            <div key={band.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 group">
              {editingId === band.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdate(band.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    autoFocus
                    className="h-8"
                  />
                  <Button size="sm" variant="ghost" onClick={() => handleUpdate(band.id)} disabled={!editName.trim()}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="text-sm font-medium">{band.name}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setEditingId(band.id); setEditName(band.name); }}
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
                          <AlertDialogTitle>Delete Salary Band</AlertDialogTitle>
                          <AlertDialogDescription>
                            Delete "<strong>{band.name}</strong>"? Existing employees with this salary band will keep their current assignment.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(band.id, band.name)}
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

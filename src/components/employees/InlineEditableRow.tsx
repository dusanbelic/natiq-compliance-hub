import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, X, Pencil, Trash2 } from 'lucide-react';
import { getNationalityFlag } from '@/lib/mockData';
import { NATIONALITIES } from '@/lib/nationalities';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { Employee, ContractType } from '@/types/database';
import { SALARY_BANDS } from '@/lib/mockData';



interface InlineEditableRowProps {
  employee: Employee;
  onSave: (id: string, updates: Partial<Employee>) => void;
  onDelete: (employee: Employee) => void;
  onClick: (employee: Employee) => void;
  canEdit: boolean;
  canDelete: boolean;
  selected?: boolean;
  onSelectChange?: (checked: boolean) => void;
}

export function InlineEditableRow({ employee, onSave, onDelete, onClick, canEdit, canDelete, selected, onSelectChange }: InlineEditableRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<Employee>>({});
  const [natOpen, setNatOpen] = useState(false);
  const rowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft({
        full_name: employee.full_name,
        nationality: employee.nationality,
        job_title: employee.job_title,
        department: employee.department,
        contract_type: employee.contract_type,
        counts_toward_quota: employee.counts_toward_quota,
      });
    }
  }, [editing, employee]);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave(employee.id, draft);
    setEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(false);
    setDraft({});
  };

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
  };

  if (editing) {
    return (
      <tr ref={rowRef} className="border-b bg-muted/20" onClick={(e) => e.stopPropagation()}>
        <td className="p-2 w-10">
          <Checkbox checked={selected} onCheckedChange={(c) => onSelectChange?.(c === true)} disabled />
        </td>
        <td className="p-2">
          <Input
            value={draft.full_name || ''}
            onChange={(e) => setDraft({ ...draft, full_name: e.target.value })}
            className="h-8 text-sm"
            autoFocus
          />
        </td>
        <td className="p-2">
          <Popover open={natOpen} onOpenChange={setNatOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between h-8 text-sm font-normal">
                {draft.nationality
                  ? `${getNationalityFlag(draft.nationality)} ${NATIONALITIES.find(n => n.code === draft.nationality)?.name || draft.nationality}`
                  : 'Select...'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0 z-[9999]" align="start">
              <Command shouldFilter>
                <CommandInput placeholder="Search..." />
                <CommandList className="max-h-[200px] overflow-y-auto overscroll-contain" onWheel={(e) => e.stopPropagation()}>
                  <CommandEmpty>Not found.</CommandEmpty>
                  <CommandGroup>
                    {NATIONALITIES.map(n => (
                      <CommandItem
                        key={n.code}
                        value={`${n.name} ${n.code}`}
                        onSelect={() => {
                          setDraft({ ...draft, nationality: n.code });
                          setNatOpen(false);
                        }}
                      >
                        <Check className={cn('mr-2 h-3 w-3', draft.nationality === n.code ? 'opacity-100' : 'opacity-0')} />
                        {getNationalityFlag(n.code)} {n.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </td>
        <td className="p-2">
          <Input
            value={draft.job_title || ''}
            onChange={(e) => setDraft({ ...draft, job_title: e.target.value })}
            className="h-8 text-sm"
            placeholder="Job title"
          />
        </td>
        <td className="p-2">
          <Select value={draft.department || ''} onValueChange={(v) => setDraft({ ...draft, department: v })}>
            <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Dept" /></SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </td>
        <td className="p-2">
          <Select value={draft.contract_type || 'full_time'} onValueChange={(v) => setDraft({ ...draft, contract_type: v as ContractType })}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="full_time">Full Time</SelectItem>
              <SelectItem value="part_time">Part Time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="intern">Intern</SelectItem>
            </SelectContent>
          </Select>
        </td>
        <td className="p-2 text-center">
          <Switch
            checked={draft.counts_toward_quota ?? true}
            onCheckedChange={(v) => setDraft({ ...draft, counts_toward_quota: v })}
          />
        </td>
        <td className="p-2 text-right">
          <div className="flex gap-1 justify-end">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-status-green" onClick={handleSave}>
              <Check className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground" onClick={handleCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr
      className={cn(
        "border-b hover:bg-muted/30 cursor-pointer group",
        selected && "bg-primary/5"
      )}
      onClick={() => onClick(employee)}
    >
      <td className="p-3 w-10" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={selected}
          onCheckedChange={(c) => onSelectChange?.(c === true)}
          aria-label={`Select ${employee.full_name}`}
        />
      </td>
      <td className="p-3 font-medium">{employee.full_name}</td>
      <td className="p-3">
        <span className="flex items-center gap-2">
          {getNationalityFlag(employee.nationality)} {employee.nationality}
          {employee.is_national && <span className="text-xs px-1.5 py-0.5 rounded bg-teal-light text-teal font-medium">NATIONAL</span>}
        </span>
      </td>
      <td className="p-3 text-muted-foreground">{employee.job_title}</td>
      <td className="p-3 text-muted-foreground">{employee.department}</td>
      <td className="p-3 text-muted-foreground capitalize">{employee.contract_type.replace('_', ' ')}</td>
      <td className="p-3 text-center">
        {employee.counts_toward_quota ? <Check className="w-4 h-4 text-status-green mx-auto" /> : <X className="w-4 h-4 text-muted-foreground mx-auto" />}
      </td>
      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-1 justify-end">
          {canEdit && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={startEdit}>
              <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </Button>
          )}
          {canDelete && (
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
                    This will permanently delete <strong>{employee.full_name}</strong>. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(employee)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </td>
    </tr>
  );
}

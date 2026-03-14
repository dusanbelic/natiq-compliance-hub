import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Switch } from '@/components/ui/switch';
import { getNationalityFlag, SALARY_BANDS } from '@/lib/mockData';
import { NATIONALITIES } from '@/lib/nationalities';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import type { Employee, ContractType } from '@/types/database';
import { toast } from 'sonner';



const schema = z.object({
  full_name: z.string().min(1, 'Name is required').max(100),
  nationality: z.string().min(1, 'Nationality is required'),
  job_title: z.string().max(100).optional(),
  department: z.string().optional(),
  contract_type: z.enum(['full_time', 'part_time', 'contract', 'intern']),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  salary_band: z.string().optional(),
  counts_toward_quota: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface EmployeeFormDialogProps {
  open: boolean;
  onClose: () => void;
  employee?: Employee | null;
  onSave: (data: FormData) => void;
}

export function EmployeeFormDialog({ open, onClose, employee, onSave }: EmployeeFormDialogProps) {
  const isEdit = !!employee;
  const [nationalityOpen, setNationalityOpen] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: employee?.full_name || '',
      nationality: employee?.nationality || '',
      job_title: employee?.job_title || '',
      department: employee?.department || '',
      contract_type: employee?.contract_type || 'full_time',
      start_date: employee?.start_date || '',
      end_date: employee?.end_date || '',
      salary_band: employee?.salary_band || '',
      counts_toward_quota: employee?.counts_toward_quota ?? true,
    },
  });

  const onSubmit = (data: FormData) => {
    onSave(data);
    toast.success(isEdit ? 'Employee updated' : 'Employee added');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-sora">{isEdit ? 'Edit' : 'Add'} Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Full Name *</Label>
            <Input {...register('full_name')} placeholder="e.g. Mohammed Al-Zahrani" />
            {errors.full_name && <p className="text-xs text-destructive mt-1">{errors.full_name.message}</p>}
          </div>

          <div>
            <Label>Nationality *</Label>
            <Popover open={nationalityOpen} onOpenChange={setNationalityOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={nationalityOpen}
                  className="w-full justify-between font-normal"
                >
                  {watch('nationality')
                    ? `${getNationalityFlag(watch('nationality'))} ${NATIONALITIES.find(n => n.code === watch('nationality'))?.name || watch('nationality')}`
                    : 'Select nationality...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-[9999] pointer-events-auto" align="start" side="bottom" sideOffset={4} onOpenAutoFocus={(e) => e.preventDefault()}>
                <Command shouldFilter={true}>
                  <CommandInput placeholder="Search nationality..." />
                  <CommandList className="max-h-[200px] overflow-y-auto overscroll-contain"  onWheel={(e) => e.stopPropagation()}>
                    <CommandEmpty>No nationality found.</CommandEmpty>
                    <CommandGroup>
                      {NATIONALITIES.map(n => (
                        <CommandItem
                          key={n.code}
                          value={`${n.name} ${n.code}`}
                          onSelect={() => {
                            setValue('nationality', n.code, { shouldValidate: true });
                            setNationalityOpen(false);
                          }}
                        >
                          <Check className={cn('mr-2 h-4 w-4', watch('nationality') === n.code ? 'opacity-100' : 'opacity-0')} />
                          {getNationalityFlag(n.code)} {n.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.nationality && <p className="text-xs text-destructive mt-1">{errors.nationality.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Job Title</Label>
              <Input {...register('job_title')} placeholder="Software Engineer" />
            </div>
            <div>
              <Label>Department</Label>
              <Select value={watch('department') || ''} onValueChange={(v) => setValue('department', v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Contract Type</Label>
              <Select value={watch('contract_type')} onValueChange={(v) => setValue('contract_type', v as ContractType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="intern">Intern</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Salary Band</Label>
              <Select value={watch('salary_band') || ''} onValueChange={(v) => setValue('salary_band', v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {SALARY_BANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input type="date" {...register('start_date')} />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" {...register('end_date')} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={watch('counts_toward_quota')}
              onCheckedChange={(v) => setValue('counts_toward_quota', v)}
            />
            <Label>Counts toward quota</Label>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{isEdit ? 'Save Changes' : 'Add Employee'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

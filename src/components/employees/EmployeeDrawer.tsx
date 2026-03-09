import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getNationalityFlag } from '@/lib/mockData';
import type { Employee } from '@/types/database';
import { Pencil, X } from 'lucide-react';

interface EmployeeDrawerProps {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
  onEdit: (employee: Employee) => void;
}

export function EmployeeDrawer({ employee, open, onClose, onEdit }: EmployeeDrawerProps) {
  if (!employee) return null;

  const fields = [
    { label: 'Full Name', value: employee.full_name },
    { label: 'Nationality', value: `${getNationalityFlag(employee.nationality)} ${employee.nationality}` },
    { label: 'Job Title', value: employee.job_title || '—' },
    { label: 'Department', value: employee.department || '—' },
    { label: 'Contract Type', value: employee.contract_type.replace('_', ' ') },
    { label: 'Start Date', value: employee.start_date || '—' },
    { label: 'End Date', value: employee.end_date || 'Active' },
    { label: 'Salary Band', value: employee.salary_band || '—' },
    { label: 'Counts Toward Quota', value: employee.counts_toward_quota ? 'Yes' : 'No' },
  ];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[440px]">
        <SheetHeader>
          <SheetTitle className="font-sora flex items-center justify-between">
            Employee Details
            <Button size="sm" variant="outline" onClick={() => onEdit(employee)}>
              <Pencil className="w-4 h-4 mr-1" />Edit
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-sora font-bold text-xl">
                {employee.full_name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-semibold text-lg">{employee.full_name}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{employee.job_title}</span>
                {employee.is_national && (
                  <Badge className="badge-compliant text-xs">NATIONAL</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            {fields.map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-medium capitalize">{value}</span>
              </div>
            ))}
          </div>

          {/* Contribution Note */}
          <div className="mt-6 p-3 rounded-lg bg-accent text-sm">
            <p className="text-accent-foreground">
              {employee.counts_toward_quota && employee.is_national
                ? 'This employee contributes to your nationalization ratio.'
                : employee.is_national
                ? 'This national employee is not currently counted toward your quota.'
                : 'This employee is counted in total headcount but not as a national.'}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

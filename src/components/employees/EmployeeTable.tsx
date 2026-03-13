import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { InlineEditableRow } from '@/components/employees/InlineEditableRow';
import type { Employee } from '@/types/database';

export type SortKey = 'full_name' | 'nationality' | 'job_title' | 'department' | 'contract_type' | 'counts_toward_quota';
export type SortDir = 'asc' | 'desc';

interface EmployeeTableProps {
  rows: Employee[];
  sortKey: SortKey | null;
  sortDir: SortDir;
  onToggleSort: (key: SortKey) => void;
  onInlineSave: (id: string, updates: Partial<Employee>) => Promise<void>;
  onDelete: (emp: Employee) => Promise<void>;
  onClick: (emp: Employee) => void;
  canEdit: boolean;
  canDelete: boolean;
}

const COLUMNS: [SortKey, string, string][] = [
  ['full_name', 'Name', 'text-left'],
  ['nationality', 'Nationality', 'text-left'],
  ['job_title', 'Role', 'text-left'],
  ['department', 'Department', 'text-left'],
  ['contract_type', 'Contract', 'text-left'],
  ['counts_toward_quota', 'Quota', 'text-center'],
];

function SortIcon({ column, sortKey, sortDir }: { column: SortKey; sortKey: SortKey | null; sortDir: SortDir }) {
  if (sortKey !== column) return <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/50" />;
  return sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-primary" /> : <ArrowDown className="w-3.5 h-3.5 text-primary" />;
}

export function EmployeeTable({
  rows,
  sortKey,
  sortDir,
  onToggleSort,
  onInlineSave,
  onDelete,
  onClick,
  canEdit,
  canDelete,
}: EmployeeTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            {COLUMNS.map(([key, label, align]) => (
              <th
                key={key}
                className={`${align} p-3 font-medium cursor-pointer select-none hover:bg-muted/80 transition-colors`}
                onClick={() => onToggleSort(key)}
              >
                <span className="inline-flex items-center gap-1.5">
                  {label}
                  <SortIcon column={key} sortKey={sortKey} sortDir={sortDir} />
                </span>
              </th>
            ))}
            <th className="text-right p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((emp) => (
            <InlineEditableRow
              key={emp.id}
              employee={emp}
              onSave={onInlineSave}
              onDelete={onDelete}
              onClick={onClick}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

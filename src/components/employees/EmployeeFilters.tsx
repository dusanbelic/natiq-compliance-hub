import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmployeeFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  natFilter: 'all' | 'nationals' | 'expats';
  onNatFilterChange: (value: 'all' | 'nationals' | 'expats') => void;
  deptFilter: string;
  onDeptFilterChange: (value: string) => void;
  departments: string[];
}

export function EmployeeFilters({
  search,
  onSearchChange,
  natFilter,
  onNatFilterChange,
  deptFilter,
  onDeptFilterChange,
  departments,
}: EmployeeFiltersProps) {
  const navigate = useNavigate();

  return (
    <div className="flex gap-3 flex-wrap items-center">
      <div className="relative max-w-sm flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, department, nationality..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={natFilter} onValueChange={(v) => onNatFilterChange(v as 'all' | 'nationals' | 'expats')}>
        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Nationalities</SelectItem>
          <SelectItem value="nationals">Nationals Only</SelectItem>
          <SelectItem value="expats">Expats Only</SelectItem>
        </SelectContent>
      </Select>
      <Select value={deptFilter} onValueChange={onDeptFilterChange}>
        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

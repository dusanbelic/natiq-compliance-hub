import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEntity } from '@/contexts/EntityContext';
import { MOCK_EMPLOYEES, getNationalityFlag, COUNTRY_FLAGS } from '@/lib/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { Search, Plus, Upload, Check, X } from 'lucide-react';

export default function Employees() {
  const { selectedEntity } = useEntity();
  const employees = MOCK_EMPLOYEES[selectedEntity.id] || [];
  const [search, setSearch] = useState('');

  const filtered = employees.filter((e) => e.full_name.toLowerCase().includes(search.toLowerCase()) || e.department?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-sora font-bold text-2xl">Employees <span className="text-muted-foreground text-lg">({employees.length})</span></h1>
        <div className="flex gap-2">
          <Button variant="outline"><Upload className="w-4 h-4 mr-2" />Import CSV</Button>
          <Button><Plus className="w-4 h-4 mr-2" />Add Employee</Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name or department..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

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
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <tr key={emp.id} className="border-b hover:bg-muted/30 cursor-pointer">
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
                    <td className="p-3 text-center">{emp.counts_toward_quota ? <Check className="w-4 h-4 text-status-green mx-auto" /> : <X className="w-4 h-4 text-muted-foreground mx-auto" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, AlertTriangle, Check, Download } from 'lucide-react';
import { toast } from 'sonner';

interface CSVImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (employees: Record<string, string>[]) => void;
}

type Step = 'upload' | 'mapping' | 'preview' | 'importing' | 'done';

const EXPECTED_COLUMNS = ['full_name', 'nationality', 'job_title', 'department', 'contract_type', 'start_date', 'salary_band'];
const COLUMN_LABELS: Record<string, string> = {
  full_name: 'Full Name',
  nationality: 'Nationality',
  job_title: 'Job Title',
  department: 'Department',
  contract_type: 'Contract Type',
  start_date: 'Start Date',
  salary_band: 'Salary Band',
};

function guessMapping(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  const lowerHeaders = headers.map(h => h.toLowerCase().replace(/[_\s-]+/g, ''));
  
  const patterns: Record<string, string[]> = {
    full_name: ['fullname', 'name', 'employeename', 'employee'],
    nationality: ['nationality', 'nation', 'country', 'citizenry'],
    job_title: ['jobtitle', 'title', 'position', 'role'],
    department: ['department', 'dept', 'division', 'team'],
    contract_type: ['contracttype', 'contract', 'type', 'employment'],
    start_date: ['startdate', 'hiredate', 'dateofjoining', 'joindate', 'start'],
    salary_band: ['salaryband', 'salary', 'grade', 'level', 'band'],
  };

  for (const [field, pats] of Object.entries(patterns)) {
    const idx = lowerHeaders.findIndex(h => pats.some(p => h.includes(p)));
    if (idx >= 0) map[field] = headers[idx];
  }
  return map;
}

export function CSVImportDialog({ open, onClose, onImport }: CSVImportDialogProps) {
  const [step, setStep] = useState<Step>('upload');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const reset = () => {
    setStep('upload');
    setHeaders([]);
    setRows([]);
    setMapping({});
    setErrors([]);
    setProgress(0);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n').map(l => l.split(',').map(c => c.trim().replace(/^"|"$/g, '')));
    if (lines.length < 2) {
      toast.error('CSV must have a header row and at least one data row');
      return;
    }
    const h = lines[0];
    const r = lines.slice(1);
    setHeaders(h);
    setRows(r);
    setMapping(guessMapping(h));
    setStep('mapping');
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a .csv file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => parseCSV(e.target?.result as string);
    reader.readAsText(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const validateAndPreview = () => {
    const errs: string[] = [];
    if (!mapping.full_name) errs.push('Name column is required');
    if (!mapping.nationality) errs.push('Nationality column is required');
    
    rows.forEach((row, i) => {
      const nameIdx = headers.indexOf(mapping.full_name || '');
      const natIdx = headers.indexOf(mapping.nationality || '');
      if (nameIdx >= 0 && !row[nameIdx]?.trim()) errs.push(`Row ${i + 2}: Missing name`);
      if (natIdx >= 0 && !row[natIdx]?.trim()) errs.push(`Row ${i + 2}: Missing nationality`);
    });

    setErrors(errs.slice(0, 10));
    setStep('preview');
  };

  const doImport = () => {
    setStep('importing');
    const mapped = rows.map(row => {
      const obj: Record<string, string> = {};
      for (const [field, header] of Object.entries(mapping)) {
        const idx = headers.indexOf(header);
        if (idx >= 0) obj[field] = row[idx] || '';
      }
      return obj;
    });

    let p = 0;
    const interval = setInterval(() => {
      p += 20;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setStep('done');
        onImport(mapped);
      }
    }, 300);
  };

  const downloadSample = () => {
    const csv = 'full_name,nationality,job_title,department,contract_type,start_date,salary_band\nMohammed Al-Zahrani,SA,Software Engineer,Engineering,full_time,2024-01-15,Mid\nRajesh Kumar,IN,Product Manager,Engineering,full_time,2023-06-01,Senior';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'natiq_employee_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-sora">Import Employees from CSV</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          {['Upload', 'Map Columns', 'Preview', 'Import'].map((label, i) => {
            const stepIdx = ['upload', 'mapping', 'preview', 'importing'].indexOf(step);
            const isDone = i < stepIdx || step === 'done';
            const isCurrent = i === stepIdx;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isDone ? 'bg-primary text-primary-foreground' : isCurrent ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {isDone ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span className={isCurrent ? 'font-medium text-foreground' : ''}>{label}</span>
                {i < 3 && <div className="w-8 h-px bg-border" />}
              </div>
            );
          })}
        </div>

        {step === 'upload' && (
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${dragOver ? 'border-primary bg-accent' : 'border-border hover:border-primary/50'}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('csv-input')?.click()}
            >
              <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium">Drop your CSV file here</p>
              <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
              <input id="csv-input" type="file" accept=".csv" className="hidden" onChange={handleFileInput} />
            </div>
            <Button variant="outline" className="w-full" onClick={downloadSample}>
              <Download className="w-4 h-4 mr-2" />Download Sample CSV
            </Button>
          </div>
        )}

        {step === 'mapping' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Map your CSV columns to NatIQ fields. We've auto-detected what we can.</p>
            <div className="space-y-3">
              {EXPECTED_COLUMNS.map(field => (
                <div key={field} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-32">{COLUMN_LABELS[field]}</span>
                  <select
                    className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={mapping[field] || ''}
                    onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                  >
                    <option value="">— Skip —</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  {mapping[field] && <Check className="w-4 h-4 text-status-green" />}
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setStep('upload')}>Back</Button>
              <Button onClick={validateAndPreview}>Preview</Button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            {errors.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-light space-y-1">
                <div className="flex items-center gap-2 text-amber font-medium text-sm">
                  <AlertTriangle className="w-4 h-4" />{errors.length} issue{errors.length > 1 ? 's' : ''} found
                </div>
                {errors.map((err, i) => <p key={i} className="text-xs text-amber/80">{err}</p>)}
              </div>
            )}
            <div className="overflow-x-auto max-h-48 border rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    {Object.entries(mapping).filter(([,v]) => v).map(([field]) => (
                      <th key={field} className="p-2 text-left font-medium">{COLUMN_LABELS[field]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-t">
                      {Object.entries(mapping).filter(([,v]) => v).map(([field, header]) => (
                        <td key={field} className="p-2">{row[headers.indexOf(header)] || '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              <FileText className="w-4 h-4 inline mr-1" />Ready to import <strong>{rows.length}</strong> employees
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setStep('mapping')}>Back</Button>
              <Button onClick={doImport}>Import {rows.length} Employees</Button>
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="py-8 space-y-4 text-center">
            <p className="font-medium">Importing employees...</p>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {progress < 30 ? 'Uploading...' : progress < 60 ? 'Validating...' : progress < 90 ? 'Importing...' : 'Finishing...'}
            </p>
          </div>
        )}

        {step === 'done' && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-status-green-light mx-auto flex items-center justify-center">
              <Check className="w-8 h-8 text-status-green" />
            </div>
            <p className="font-semibold text-lg">{rows.length} employees imported!</p>
            <Button onClick={handleClose}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

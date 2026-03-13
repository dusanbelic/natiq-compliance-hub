import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50] as const;

interface EmployeePaginationProps {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function EmployeePagination({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
}: EmployeePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  if (totalItems <= pageSize) return null;

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
    .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3">
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground">
          Showing {((safePage - 1) * pageSize) + 1}–{Math.min(safePage * pageSize, totalItems)} of {totalItems}
        </p>
        <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
          <SelectTrigger className="h-8 w-[70px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map(size => (
              <SelectItem key={size} value={String(size)}>{size}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">per page</span>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage <= 1} onClick={() => onPageChange(safePage - 1)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {pageNumbers.map((p, idx) =>
          p === 'ellipsis' ? (
            <span key={`e${idx}`} className="px-1 text-muted-foreground">…</span>
          ) : (
            <Button key={p} variant={p === safePage ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={() => onPageChange(p)}>
              {p}
            </Button>
          )
        )}
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage >= totalPages} onClick={() => onPageChange(safePage + 1)}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

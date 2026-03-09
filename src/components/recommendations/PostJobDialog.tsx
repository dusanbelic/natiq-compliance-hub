import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import type { Recommendation } from '@/types/database';

interface PostJobDialogProps {
  open: boolean;
  onClose: () => void;
  recommendation: Recommendation | null;
  onPost: () => void;
}

const JOB_BOARDS = [
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'jadara', label: 'Jadara (Saudi)' },
  { id: 'bayt', label: 'Bayt.com' },
  { id: 'indeed', label: 'Indeed' },
];

export function PostJobDialog({ open, onClose, recommendation, onPost }: PostJobDialogProps) {
  const [selectedBoards, setSelectedBoards] = useState<string[]>(['linkedin', 'jadara']);
  const [posting, setPosting] = useState(false);

  const department = recommendation?.title?.match(/in (\w+)/)?.[1] || 'Operations';
  const defaultTitle = recommendation?.title?.replace(/^Hire \d+ /, '').replace(/in \w+ department/, '').trim() || 'National Employee';

  const handlePost = () => {
    setPosting(true);
    setTimeout(() => {
      setPosting(false);
      toast.success(`Job posted to ${selectedBoards.length} platform${selectedBoards.length > 1 ? 's' : ''}`);
      onPost();
      onClose();
    }, 1200);
  };

  const toggleBoard = (id: string) => {
    setSelectedBoards(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-sora">Post Job Opening</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Job Title</Label>
            <Input defaultValue={defaultTitle} />
          </div>
          <div>
            <Label>Department</Label>
            <Input defaultValue={department} />
          </div>
          <div>
            <Label>Job Description</Label>
            <Textarea
              rows={4}
              defaultValue={`We are looking for qualified national candidates to join our ${department} team. This position supports our nationalization compliance objectives while offering competitive compensation and growth opportunities.`}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Salary Min</Label>
              <Input type="number" placeholder="e.g. 8000" />
            </div>
            <div>
              <Label>Salary Max</Label>
              <Input type="number" placeholder="e.g. 15000" />
            </div>
          </div>
          <div>
            <Label className="mb-2 block">Post to</Label>
            <div className="grid grid-cols-2 gap-3">
              {JOB_BOARDS.map(board => (
                <label key={board.id} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedBoards.includes(board.id)}
                    onCheckedChange={() => toggleBoard(board.id)}
                  />
                  <span className="text-sm">{board.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handlePost} disabled={posting || selectedBoards.length === 0}>
              {posting ? 'Posting...' : `Post to ${selectedBoards.length} Platform${selectedBoards.length > 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface InviteTeamDialogProps {
  open: boolean;
  onClose: () => void;
}

export function InviteTeamDialog({ open, onClose }: InviteTeamDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('hr_manager');
  const [sending, setSending] = useState(false);

  const handleInvite = () => {
    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success(`Invitation sent to ${email}`);
      setEmail('');
      onClose();
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sora">Invite Team Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Email Address</Label>
            <Input type="email" placeholder="colleague@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="hr_director">HR Director</SelectItem>
                <SelectItem value="hr_manager">HR Manager</SelectItem>
                <SelectItem value="cfo">CFO</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleInvite} disabled={sending}>{sending ? 'Sending...' : 'Send Invitation'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

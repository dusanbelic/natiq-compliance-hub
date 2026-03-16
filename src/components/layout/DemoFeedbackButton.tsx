import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function DemoFeedbackButton() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ referral_source: '', challenge_text: '', would_use: '' });

  const handleSubmit = async () => {
    if (!form.would_use) { toast.error('Please answer all questions'); return; }
    setSubmitting(true);
    try {
      await supabase.from('demo_feedback' as any).insert(form);
      setSubmitted(true);
      toast.success('Thanks for your feedback!');
    } catch { toast.error('Something went wrong'); }
    setSubmitting(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-white text-sm font-medium hover:scale-105 transition-transform"
        style={{ background: '#1B3A5C' }}
      >
        <MessageCircle className="w-4 h-4" /> What do you think?
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-sora">Quick Feedback</DialogTitle>
          </DialogHeader>
          {submitted ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-3">🙏</p>
              <p className="font-sora font-bold text-lg">Thanks for your feedback!</p>
              <p className="text-sm text-muted-foreground mt-1">Your input helps us build a better product.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>How did you find NatIQ?</Label>
                <Select value={form.referral_source} onValueChange={v => setForm(p => ({ ...p, referral_source: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>What is your biggest compliance challenge?</Label>
                <Textarea
                  value={form.challenge_text}
                  onChange={e => setForm(p => ({ ...p, challenge_text: e.target.value }))}
                  rows={3}
                  placeholder="e.g. Tracking Nitaqat across multiple entities..."
                />
              </div>
              <div>
                <Label>Would you use this for your company?</Label>
                <Select value={form.would_use} onValueChange={v => setForm(p => ({ ...p, would_use: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="maybe">Maybe</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {!submitted && (
            <DialogFooter>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Submit Feedback
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Linkedin, Check } from 'lucide-react';
import { toast } from 'sonner';
import { COUNTRY_FLAGS } from '@/lib/mockData';
import type { Entity, ScoreDetails } from '@/types/database';

interface ShareComplianceModalProps {
  open: boolean;
  onClose: () => void;
  entity: Entity;
  score: ScoreDetails;
}

export function ShareComplianceModal({ open, onClose, entity, score }: ShareComplianceModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText('https://natiq.io');
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkedIn = () => {
    const text = encodeURIComponent(
      `Our team just reached ${score.band} band ${score.program} compliance. Managing nationalisation compliance with NatIQ — built for the GCC. natiq.io`
    );
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://natiq.io')}&summary=${text}`,
      '_blank'
    );
  };

  const bandColor = score.band === 'PLATINUM' ? '#0D9488' : '#10B981';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sora">Share your compliance achievement</DialogTitle>
        </DialogHeader>

        {/* Shareable Card */}
        <div className="rounded-xl overflow-hidden shadow-elevated">
          <div className="bg-secondary p-6 text-white space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{COUNTRY_FLAGS[entity.country]}</span>
              <span className="font-sora font-bold text-lg">{entity.name}</span>
            </div>
            <p className="text-sm text-white/70 uppercase tracking-wider">Nationalization Compliance</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/80">{score.ratio.toFixed(1)}%</span>
                <span
                  className="text-xs px-2 py-0.5 rounded font-bold"
                  style={{ backgroundColor: bandColor, color: 'white' }}
                >
                  {score.band}
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-white/20">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(score.ratio, 100)}%`, backgroundColor: bandColor }}
                />
              </div>
            </div>
            <p className="text-xs text-white/50 pt-2">Powered by NatIQ · natiq.io</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={handleCopyLink}>
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
          <Button className="flex-1 bg-[#0077B5] hover:bg-[#006097] text-white" onClick={handleLinkedIn}>
            <Linkedin className="w-4 h-4 mr-2" />
            Share on LinkedIn
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

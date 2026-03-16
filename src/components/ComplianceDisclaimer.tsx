import { AlertTriangle, ExternalLink, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Country } from '@/types/database';

const PORTAL_URLS: Record<Country, { name: string; url: string }> = {
  SA: { name: 'Qiwa (qiwa.sa)', url: 'https://qiwa.sa' },
  AE: { name: 'Nafis (nafis.gov.ae)', url: 'https://nafis.gov.ae' },
  QA: { name: 'ADLSA (adlsa.gov.qa)', url: 'https://adlsa.gov.qa' },
  OM: { name: 'Ministry of Labour (manpower.gov.om)', url: 'https://manpower.gov.om' },
};

interface ComplianceDisclaimerProps {
  country: Country;
  className?: string;
}

export function ComplianceDisclaimer({ country, className }: ComplianceDisclaimerProps) {
  const portal = PORTAL_URLS[country];

  return (
    <Alert className={className}>
      <Info className="h-4 w-4" />
      <AlertDescription className="text-sm text-muted-foreground">
        Targets verified March 2026. Regulations change frequently. Always confirm current targets at your country's official portal before making compliance decisions.{' '}
        <a
          href={portal.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
        >
          {portal.name}
          <ExternalLink className="h-3 w-3" />
        </a>
      </AlertDescription>
    </Alert>
  );
}

interface QatarRegulationNoticeProps {
  className?: string;
}

export function QatarRegulationNotice({ className }: QatarRegulationNoticeProps) {
  return (
    <Alert className={className}>
      <AlertTriangle className="h-4 w-4 text-amber" />
      <AlertDescription className="text-xs text-muted-foreground">
        <strong>Qatar notice:</strong> Sector-specific Qatarisation targets are being set by the Ministry of Labour under Law No. 12/2024. The overall 2030 target is 20%. Check{' '}
        <a href="https://adlsa.gov.qa" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">adlsa.gov.qa</a>
        {' '}and the Tawteen portal for your specific sector requirements.
      </AlertDescription>
    </Alert>
  );
}

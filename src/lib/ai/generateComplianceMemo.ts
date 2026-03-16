import { generateText } from '@/lib/ai';

export interface MemoInput {
  entity: {
    name: string;
    country: string;
    program: string;
    industry: string | null;
    total_employees: number;
    national_count: number;
    ratio: number;
    band: string;
    target: number;
  };
  period: string;
  audience: 'board' | 'regulator' | 'internal';
  includeRecommendations: boolean;
  recommendations?: Array<{ title: string; compliance_gain: number | null; status: string }>;
}

const AUDIENCE_GUIDANCE: Record<string, string> = {
  board: 'Write an executive board summary that leads with compliance status, financial risk exposure including fine amounts, and the 3 most important actions. Keep to 400 words maximum. Use executive language.',
  regulator: 'Write a formal regulatory compliance statement suitable for government submission. Be precise and evidence-focused. Reference the specific regulation and target percentage. 500 words maximum.',
  internal: 'Write an internal HR operations report. Be practical with clear sections for action items with responsible teams and deadlines. 500 words maximum.',
};

const FINE_RATES: Record<string, { rate: number; currency: string }> = {
  SA: { rate: 10000, currency: 'SAR' },
  AE: { rate: 8000, currency: 'AED' },
  QA: { rate: 5000, currency: 'QAR' },
  OM: { rate: 3000, currency: 'OMR' },
};

const SYSTEM_PROMPT = `You are a senior GCC HR compliance consultant writing formal compliance reports. Write in professional business English. Use clear section headers formatted with markdown (##). Be precise with numbers. Never pad the report with filler sentences. Every sentence must add information or value.`;

export async function generateComplianceMemo(input: MemoInput): Promise<string> {
  const { entity, period, audience, includeRecommendations, recommendations } = input;
  const isCompliant = entity.ratio >= entity.target;
  const gap = isCompliant ? 0 : entity.target - entity.ratio;
  const fineInfo = FINE_RATES[entity.country] || FINE_RATES.SA;
  const estimatedFine = gap > 0 ? Math.ceil((gap / 100) * entity.total_employees * fineInfo.rate) : 0;

  const audienceInstruction = AUDIENCE_GUIDANCE[audience] || AUDIENCE_GUIDANCE.internal;

  let recsText = '';
  if (includeRecommendations && recommendations?.length) {
    recsText = `\n\nPlanned Actions from Recommendations:\n${recommendations.map(r => `- ${r.title} (estimated gain: ${r.compliance_gain ?? 'N/A'}%, status: ${r.status})`).join('\n')}`;
  }

  const userMessage = `Write a compliance memo for the following entity:

Entity: ${entity.name}
Country: ${entity.country}
Program: ${entity.program}
Industry: ${entity.industry || 'General'}
Period: ${period}
Total Employees: ${entity.total_employees}
Nationals: ${entity.national_count}
Current Ratio: ${entity.ratio.toFixed(1)}%
Target: ${entity.target}%
Band: ${entity.band}
Status: ${isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
Gap: ${gap.toFixed(1)} percentage points
Estimated Monthly Fine Exposure: ${estimatedFine > 0 ? `${fineInfo.currency} ${estimatedFine.toLocaleString()}` : 'None'}
${recsText}

${audienceInstruction}

Format as a professional memo with To/From/Date/Subject headers at the top.`;

  return generateText(SYSTEM_PROMPT, userMessage, 'pro');
}

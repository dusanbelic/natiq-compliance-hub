import { generateJSON } from '@/lib/ai';

export interface RegulatoryImpactInput {
  change: {
    country: string;
    program: string;
    headline: string;
    summary: string | null;
    change_type: string | null;
    effective_date: string | null;
    affects_sectors: string[] | null;
  };
  entity: {
    name: string;
    country: string;
    industry_sector: string | null;
    current_ratio: number;
    current_band: string;
    total_employees: number;
    national_count: number;
  };
}

export interface RegulatoryImpactResult {
  affected: boolean;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  summary: string;
  current_status: string;
  gap: number | null;
  immediate_actions: string[];
  time_to_act: string | null;
}

const SYSTEM_PROMPT = `You are a GCC employment law compliance specialist. Analyse whether a regulatory change affects a specific company entity. Be direct and practical because the reader is an HR director who needs to know immediately whether they must act.`;

export async function analyseRegulatoryImpact(input: RegulatoryImpactInput): Promise<RegulatoryImpactResult> {
  const userMessage = `Regulatory Change:
- Country: ${input.change.country}
- Program: ${input.change.program}
- Headline: ${input.change.headline}
- Summary: ${input.change.summary || 'N/A'}
- Change Type: ${input.change.change_type || 'Unknown'}
- Effective Date: ${input.change.effective_date || 'Unknown'}
- Affects Sectors: ${input.change.affects_sectors?.join(', ') || 'All sectors'}

Company Entity:
- Name: ${input.entity.name}
- Country: ${input.entity.country}
- Industry: ${input.entity.industry_sector || 'General'}
- Current Ratio: ${input.entity.current_ratio.toFixed(1)}%
- Current Band: ${input.entity.current_band}
- Total Employees: ${input.entity.total_employees}
- Nationals: ${input.entity.national_count}

Return a JSON object with: affected (boolean), severity (HIGH/MEDIUM/LOW/NONE), summary (2-3 sentences), current_status (string), gap (number or null), immediate_actions (array of 2-4 strings), time_to_act (string or null).`;

  const tools = [{
    type: "function",
    function: {
      name: "provide_impact_analysis",
      description: "Return regulatory impact analysis for the company.",
      parameters: {
        type: "object",
        properties: {
          affected: { type: "boolean" },
          severity: { type: "string", enum: ["HIGH", "MEDIUM", "LOW", "NONE"] },
          summary: { type: "string" },
          current_status: { type: "string" },
          gap: { type: "number", nullable: true },
          immediate_actions: { type: "array", items: { type: "string" } },
          time_to_act: { type: "string", nullable: true },
        },
        required: ["affected", "severity", "summary", "current_status", "immediate_actions"],
      },
    },
  }];

  const result = await generateJSON<RegulatoryImpactResult>(
    SYSTEM_PROMPT,
    userMessage,
    'flash',
    tools,
    { type: "function", function: { name: "provide_impact_analysis" } }
  );

  if (typeof result === 'string') return JSON.parse(result);
  return result;
}

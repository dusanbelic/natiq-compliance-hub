import { generateJSON } from '@/lib/ai';

export interface RecommendationInput {
  entityName: string;
  country: 'SA' | 'AE' | 'QA' | 'OM';
  program: string;
  currentRatio: number;
  targetRatio: number;
  band: string;
  totalEmployees: number;
  nationalCount: number;
  expatCount: number;
  departmentBreakdown: Array<{ department: string; total: number; nationals: number; ratio: number }>;
  contractBreakdown: Array<{ contractType: string; count: number; nationalCount: number }>;
}

export interface AIRecommendation {
  priority: 'CRITICAL' | 'IMPORTANT' | 'OPTIONAL';
  title: string;
  description: string;
  action_type: 'HIRE_NATIONAL' | 'RECLASSIFY' | 'REVIEW_CONTRACTS' | 'OTHER';
  compliance_gain: number;
  effort_level: 'LOW' | 'MEDIUM' | 'HIGH';
  suggested_roles?: string[];
  suggested_departments?: string[];
}

const SYSTEM_PROMPT = `You are a GCC nationalization compliance expert. Generate specific, ranked, actionable recommendations to help this company improve its compliance ratio. Be precise and name real departments, job titles, and concrete steps. Never be generic.`;

export async function generateRecommendations(input: RecommendationInput): Promise<AIRecommendation[]> {
  const userMessage = `Entity: ${input.entityName}
Country: ${input.country}
Program: ${input.program}
Current Ratio: ${input.currentRatio.toFixed(1)}%
Target Ratio: ${input.targetRatio}%
Band: ${input.band}
Total Employees: ${input.totalEmployees}
Nationals: ${input.nationalCount}
Expats: ${input.expatCount}

Department Breakdown:
${input.departmentBreakdown.map(d => `- ${d.department}: ${d.total} total, ${d.nationals} nationals (${d.ratio.toFixed(1)}%)`).join('\n')}

Contract Type Breakdown:
${input.contractBreakdown.map(c => `- ${c.contractType}: ${c.count} total, ${c.nationalCount} nationals`).join('\n')}

Generate 4 to 7 recommendations as a JSON array. Each item must have: priority (CRITICAL, IMPORTANT, or OPTIONAL), title, description (max 60 words), action_type (HIRE_NATIONAL, RECLASSIFY, REVIEW_CONTRACTS, or OTHER), compliance_gain (percentage points gained as a number), effort_level (LOW, MEDIUM, or HIGH), optional suggested_roles array, and optional suggested_departments array.`;

  const tools = [{
    type: "function",
    function: {
      name: "provide_recommendations",
      description: "Return 4-7 actionable compliance recommendations.",
      parameters: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                priority: { type: "string", enum: ["CRITICAL", "IMPORTANT", "OPTIONAL"] },
                title: { type: "string" },
                description: { type: "string" },
                action_type: { type: "string", enum: ["HIRE_NATIONAL", "RECLASSIFY", "REVIEW_CONTRACTS", "OTHER"] },
                compliance_gain: { type: "number" },
                effort_level: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
                suggested_roles: { type: "array", items: { type: "string" } },
                suggested_departments: { type: "array", items: { type: "string" } },
              },
              required: ["priority", "title", "description", "action_type", "compliance_gain", "effort_level"],
            },
          },
        },
        required: ["recommendations"],
      },
    },
  }];

  const result = await generateJSON<{ recommendations: AIRecommendation[] }>(
    SYSTEM_PROMPT,
    userMessage,
    'flash',
    tools,
    { type: "function", function: { name: "provide_recommendations" } }
  );

  // Handle if result is a string (tool call arguments come as string)
  if (typeof result === 'string') {
    const parsed = JSON.parse(result);
    return parsed.recommendations || parsed;
  }

  return result.recommendations || (result as unknown as AIRecommendation[]);
}

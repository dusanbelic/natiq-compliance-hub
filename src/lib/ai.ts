import { supabase } from '@/integrations/supabase/client';

export class AIError extends Error {
  type: 'AI_CALL_ERROR' | 'AI_PARSE_ERROR';
  raw?: string;

  constructor(type: 'AI_CALL_ERROR' | 'AI_PARSE_ERROR', message: string, raw?: string) {
    super(message);
    this.type = type;
    this.raw = raw;
    this.name = 'AIError';
  }
}

type ModelTier = 'flash' | 'pro';

export async function generateJSON<T = unknown>(
  systemPrompt: string,
  userMessage: string,
  modelTier: ModelTier = 'flash',
  tools?: unknown[],
  tool_choice?: unknown
): Promise<T> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-generate', {
      body: { systemPrompt, userMessage, mode: 'json', modelTier, tools, tool_choice },
    });

    if (error) throw new AIError('AI_CALL_ERROR', error.message || 'AI call failed');

    if (data?.error) throw new AIError('AI_CALL_ERROR', data.error);

    let raw = data?.data;
    if (!raw) throw new AIError('AI_CALL_ERROR', 'No data returned from AI');

    // If data is already an object, return it
    if (typeof raw === 'object') return raw as T;

    // Strip markdown fences
    let jsonStr = typeof raw === 'string' ? raw : JSON.stringify(raw);
    jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    try {
      return JSON.parse(jsonStr) as T;
    } catch {
      throw new AIError('AI_PARSE_ERROR', 'Failed to parse AI response as JSON', jsonStr);
    }
  } catch (e) {
    if (e instanceof AIError) throw e;
    throw new AIError('AI_CALL_ERROR', e instanceof Error ? e.message : 'Unknown AI error');
  }
}

export async function generateText(
  systemPrompt: string,
  userMessage: string,
  modelTier: ModelTier = 'flash'
): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-generate', {
      body: { systemPrompt, userMessage, mode: 'text', modelTier },
    });

    if (error) throw new AIError('AI_CALL_ERROR', error.message || 'AI call failed');
    if (data?.error) throw new AIError('AI_CALL_ERROR', data.error);

    const text = data?.data;
    if (!text || typeof text !== 'string') {
      throw new AIError('AI_CALL_ERROR', 'No text returned from AI');
    }

    return text;
  } catch (e) {
    if (e instanceof AIError) throw e;
    throw new AIError('AI_CALL_ERROR', e instanceof Error ? e.message : 'Unknown AI error');
  }
}

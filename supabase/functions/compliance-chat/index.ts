import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are NatIQ, an expert AI assistant specializing in GCC workforce nationalization compliance. You help HR professionals navigate:

**Nitaqat (Saudi Arabia):**
- Color band system: Platinum (>28%), Green (15-28%), Yellow (10-15%), Red (<10%)
- Targets vary by sector and company size
- Benefits include visa processing speed and hiring flexibility

**Emiratisation / Nafis (UAE):**
- Private sector companies with 50+ employees must maintain minimum Emirati ratios
- Current target ~10% with 2% annual increases
- Penalties: AED 96,000+ per missing Emirati per year
- Government salary subsidies up to AED 9,000/month per Emirati hire

**Qatarisation (Qatar):**
- Oil & Gas: 30% minimum, Banking: 50% for customer-facing, Other: 20%
- Quarterly reporting via ADLSA portal

**Omanisation (Oman):**
- Hospitality: 30%, Banking/Finance: 45%, General: 20%
- Annual targets set by Ministry of Labour

**Compliance Ratio Formula:**
Ratio = (Qualifying Nationals ÷ Total Qualifying Workforce) × 100
- Full-time nationals count 100%, part-time typically 50%
- Contract workers <90 days and unpaid leave employees excluded

**Your behavior:**
- Give concise, actionable answers with specific numbers and regulations
- Use markdown formatting (bold, bullets, code blocks) for clarity
- When asked about improving ratios, suggest concrete hiring, reclassification, and training strategies
- If asked about something outside GCC compliance, politely redirect
- Keep responses focused and under 300 words unless the user asks for detail`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("compliance-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

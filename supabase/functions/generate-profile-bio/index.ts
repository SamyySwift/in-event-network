import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, company, niche, existingBio } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build context from available information
    const contextParts = [];
    if (name) contextParts.push(`Name: ${name}`);
    if (company) contextParts.push(`Company: ${company}`);
    if (niche) contextParts.push(`Professional Niche: ${niche}`);
    if (existingBio) contextParts.push(`Current bio: ${existingBio}`);

    const context = contextParts.length > 0 
      ? contextParts.join('\n') 
      : 'Limited information available';

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a professional bio writer. Create compelling, concise professional bios (2-3 sentences) based on the information provided. The bio should be engaging, highlight key professional aspects, and be suitable for networking events. Write in third person if a name is provided, otherwise use first person. Return only the bio text without quotes or additional formatting.'
          },
          {
            role: 'user',
            content: `Generate a professional bio based on this information:\n\n${context}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedBio = data.choices?.[0]?.message?.content;

    if (!generatedBio) {
      throw new Error('No bio generated from AI');
    }

    return new Response(
      JSON.stringify({ bio: generatedBio }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-profile-bio:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate bio' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

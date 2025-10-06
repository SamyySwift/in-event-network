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
    const { name, imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let messages;
    
    if (imageBase64) {
      // Image identification mode
      messages = [
        {
          role: 'system',
          content: 'You are an expert at identifying people in images. Analyze the image and provide information about the person.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Identify this person and provide their professional information in JSON format with these fields: name, title, company, bio (2-3 sentences about their professional background). If you can't identify the person, return an error field explaining why.`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64
              }
            }
          ]
        }
      ];
    } else if (name) {
      // Name-based bio generation
      messages = [
        {
          role: 'system',
          content: 'You are an expert researcher who finds accurate professional information about speakers and professionals.'
        },
        {
          role: 'user',
          content: `Find professional information about "${name}" and provide it in JSON format with these fields: title (their current professional title), company (their current company/organization), bio (a 2-3 sentence professional biography highlighting their expertise and achievements). If you cannot find reliable information, return an error field explaining this.`
        }
      ];
    } else {
      return new Response(
        JSON.stringify({ error: 'Either name or imageBase64 is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from AI');
    }

    // Try to parse as JSON
    let result;
    try {
      result = JSON.parse(content);
    } catch {
      // If not JSON, try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Could not parse AI response as JSON');
      }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-speaker-info:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate speaker information' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

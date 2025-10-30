import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { csvHeaders, sampleRows } = await req.json();

    if (!csvHeaders || !Array.isArray(csvHeaders)) {
      throw new Error('csvHeaders array is required');
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Use AI to intelligently map CSV columns to our required fields
    const prompt = `You are a CSV data analyzer. Analyze these CSV headers and sample data, then identify which columns contain:
1. Full name or person's name (required)
2. Email address (required)
3. Phone number (optional)
4. Any other relevant information

CSV Headers: ${csvHeaders.join(', ')}

Sample Rows (first 3):
${JSON.stringify(sampleRows, null, 2)}

Respond with ONLY a JSON object in this exact format (no markdown, no explanation):
{
  "nameColumn": "exact_column_name_for_name",
  "emailColumn": "exact_column_name_for_email",
  "phoneColumn": "exact_column_name_for_phone_or_null",
  "otherColumns": ["list", "of", "other", "relevant", "columns"],
  "confidence": "high/medium/low",
  "reasoning": "brief explanation of your mapping decisions"
}`;

    const aiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': lovableApiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API request failed: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const responseText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('No response from AI');
    }

    // Parse AI response
    const cleanedResponse = responseText.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const mapping = JSON.parse(cleanedResponse);

    return new Response(
      JSON.stringify({
        success: true,
        mapping,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-csv-import:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

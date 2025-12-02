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
    const { headers, sampleData } = await req.json();
    
    if (!headers || !sampleData) {
      return new Response(
        JSON.stringify({ error: 'Headers and sample data are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `Analyze this CSV/spreadsheet data and identify which columns contain:
1. Name/Full Name (could be "name", "full name", "attendee name", etc.)
2. Email address (could be "email", "email address", "e-mail", etc.)
3. Phone number (could be "phone", "mobile", "contact", "phone number", etc.)

CSV Headers: ${headers.join(', ')}

Sample Data:
${sampleData}

Return a JSON object with this exact structure:
{
  "nameColumn": "exact_column_name_from_headers",
  "emailColumn": "exact_column_name_from_headers",
  "phoneColumn": "exact_column_name_from_headers_or_null",
  "additionalColumns": ["other_column_1", "other_column_2"],
  "confidence": "high/medium/low"
}

Be smart about variations - "Full Name" and "name" both refer to name. "Email Address" and "email" both refer to email. Only return columns that actually exist in the provided headers.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: 'You are a CSV analysis expert. Return only valid JSON without any markdown formatting or code blocks.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error('Failed to analyze CSV with AI');
    }

    const aiData = await aiResponse.json();
    let analysisText = aiData.choices?.[0]?.message?.content || '{}';
    
    // Clean up the response - remove markdown code blocks if present
    analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (e) {
      console.error('Failed to parse AI response:', analysisText);
      // Fallback: try basic pattern matching
      const nameCols = headers.filter((h: string) => 
        /name/i.test(h) || /full.*name/i.test(h) || /attendee/i.test(h)
      );
      const emailCols = headers.filter((h: string) => 
        /email/i.test(h) || /e-mail/i.test(h)
      );
      const phoneCols = headers.filter((h: string) => 
        /phone/i.test(h) || /mobile/i.test(h) || /contact/i.test(h)
      );
      
      analysis = {
        nameColumn: nameCols[0] || headers[0],
        emailColumn: emailCols[0] || headers[1],
        phoneColumn: phoneCols[0] || null,
        additionalColumns: headers.filter((h: string) => 
          h !== nameCols[0] && h !== emailCols[0] && h !== phoneCols[0]
        ),
        confidence: 'low'
      };
    }

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-csv-import:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

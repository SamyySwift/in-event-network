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

    const prompt = `Analyze this CSV/spreadsheet data and identify which columns contain attendee information.

COLUMN TYPES TO IDENTIFY:
1. Name/Full Name - Look for: "name", "full name", "fullname", "attendee name", "customer name", "customer fullname", "buyer name", "participant", "guest name", "contact name", "person", etc.
2. Email address - Look for: "email", "email address", "e-mail", "e_mail", "mail", "customer email", "buyer email", "contact email", etc.
3. Phone number - Look for: "phone", "phone number", "mobile", "mobile number", "contact", "contact number", "tel", "telephone", "cell", "cellphone", "gsm", "customer mobile", "buyer phone", etc.

IMPORTANT: 
- Column names may be in any language or format
- Be case-insensitive
- Phone numbers might appear as scientific notation in the data (e.g., "2.34E+13") - still identify the column
- Not all files will have email - some only have name + phone
- Look at the sample data to help identify columns if headers are unclear

CSV Headers: ${headers.join(', ')}

Sample Data:
${sampleData}

Return a JSON object with this exact structure:
{
  "nameColumn": "exact_column_name_from_headers",
  "emailColumn": "exact_column_name_from_headers_or_null",
  "phoneColumn": "exact_column_name_from_headers_or_null",
  "additionalColumns": ["other_column_1", "other_column_2"],
  "confidence": "high/medium/low"
}

Only return columns that actually exist in the provided headers. Use null if a column type is not found.`;

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

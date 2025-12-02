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
    const { question } = await req.json();
    
    if (!question || question.trim().length < 5) {
      return new Response(
        JSON.stringify({ error: 'Question must be at least 5 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating quiz options for question:', question);

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
            content: `You are a quiz question generator. Given a question, generate exactly 4 multiple choice options where only ONE is correct. 
            
Rules:
- All options must be plausible and relevant to the question
- Options should be similar in length and style
- The wrong options (distractors) should be believable but clearly incorrect
- Do not include option labels (A, B, C, D) in the options themselves

You MUST respond with a JSON object in this exact format:
{
  "options": ["option1", "option2", "option3", "option4"],
  "correct_answer": "the correct option text exactly as it appears in options array"
}`
          },
          {
            role: 'user',
            content: `Generate 4 multiple choice options for this quiz question: "${question}"`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_quiz_options",
              description: "Generate quiz options and identify the correct answer",
              parameters: {
                type: "object",
                properties: {
                  options: {
                    type: "array",
                    items: { type: "string" },
                    description: "Array of exactly 4 multiple choice options"
                  },
                  correct_answer: {
                    type: "string",
                    description: "The correct answer, must exactly match one of the options"
                  }
                },
                required: ["options", "correct_answer"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_quiz_options" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Failed to generate options');
    }

    const data = await response.json();
    console.log('AI response:', JSON.stringify(data));

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error('Invalid AI response format');
    }

    const result = JSON.parse(toolCall.function.arguments);
    
    // Validate the response
    if (!result.options || result.options.length !== 4 || !result.correct_answer) {
      throw new Error('Invalid options generated');
    }

    // Ensure correct_answer is in options
    if (!result.options.includes(result.correct_answer)) {
      result.correct_answer = result.options[0]; // Fallback to first option
    }

    console.log('Generated options:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating quiz options:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate options' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

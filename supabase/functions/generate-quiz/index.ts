import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context, questionCount, topic, difficulty, region } = await req.json();

    if (!topic) {
      return new Response(
        JSON.stringify({ error: 'Topic is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const numQuestions = questionCount || 10;
    const difficultyLevel = difficulty || 'mixed';
    const regionContext = region || 'general';

    const systemPrompt = `You are a quiz master who creates engaging multiple-choice quiz questions. 
Generate exactly ${numQuestions} quiz questions about ${topic}.
${regionContext !== 'general' ? `The questions should be focused on or relevant to ${regionContext}.` : ''}
${context ? `Additional context: ${context}` : ''}

Difficulty level: ${difficultyLevel}
- If "easy": Simple factual questions with obvious correct answers
- If "medium": Requires some knowledge but not too obscure
- If "hard": Challenging questions that require deep knowledge
- If "mixed": A mix of easy, medium, and hard questions

IMPORTANT: Return ONLY a valid JSON object with no additional text. The response must be a JSON object with a "questions" array containing exactly ${numQuestions} questions.

Each question must have:
- "question_text": The question (string)
- "options": Array of exactly 4 unique answer options (strings)
- "correct_answer": The correct answer (must exactly match one of the options)
- "time_limit": Time limit in seconds (15-30 based on difficulty)

Example format:
{
  "questions": [
    {
      "question_text": "What is the capital of Nigeria?",
      "options": ["Lagos", "Abuja", "Kano", "Port Harcourt"],
      "correct_answer": "Abuja",
      "time_limit": 20
    }
  ]
}`;

    console.log('Generating quiz with params:', { topic, numQuestions, difficultyLevel, regionContext });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate ${numQuestions} quiz questions about ${topic}${regionContext !== 'general' ? ` with focus on ${regionContext}` : ''}.` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate quiz' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'No response from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Raw AI response:', content.substring(0, 500));

    // Parse the JSON response - handle potential markdown code blocks
    let parsedContent;
    try {
      // Remove markdown code blocks if present
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.slice(7);
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.slice(3);
      }
      if (cleanedContent.endsWith('```')) {
        cleanedContent = cleanedContent.slice(0, -3);
      }
      cleanedContent = cleanedContent.trim();
      
      parsedContent = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Content was:', content);
      return new Response(
        JSON.stringify({ error: 'Invalid response format from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate the response structure
    if (!parsedContent.questions || !Array.isArray(parsedContent.questions)) {
      console.error('Invalid questions structure:', parsedContent);
      return new Response(
        JSON.stringify({ error: 'Invalid quiz structure from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate each question
    const validQuestions = parsedContent.questions.filter((q: any) => {
      return q.question_text && 
             Array.isArray(q.options) && 
             q.options.length >= 2 &&
             q.correct_answer &&
             q.options.includes(q.correct_answer);
    });

    if (validQuestions.length === 0) {
      console.error('No valid questions after filtering');
      return new Response(
        JSON.stringify({ error: 'No valid questions generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully generated ${validQuestions.length} questions`);

    return new Response(
      JSON.stringify({ questions: validQuestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

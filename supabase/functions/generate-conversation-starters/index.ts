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
    const { userProfile, targetProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build context from profiles
    const userContext = {
      name: userProfile.name,
      niche: userProfile.niche,
      company: userProfile.company,
      bio: userProfile.bio,
      tags: userProfile.tags || [],
      networking_preferences: userProfile.networking_preferences || []
    };

    const targetContext = {
      name: targetProfile.name,
      niche: targetProfile.niche,
      company: targetProfile.company,
      bio: targetProfile.bio,
      tags: targetProfile.tags || [],
      networking_preferences: targetProfile.networking_preferences || []
    };

    const systemPrompt = `You are a professional networking assistant helping attendees at an event connect meaningfully. Generate conversation starters that are:
- Specific and personalized based on shared interests
- Professional but friendly
- Action-oriented (not just generic questions)
- Relevant to their profiles and backgrounds

Return ONLY a JSON array of 3-5 conversation starters as strings. No additional text.`;

    const userPrompt = `Generate conversation starters for ${userContext.name} to connect with ${targetContext.name}.

User Profile:
- Niche: ${userContext.niche || 'Not specified'}
- Company: ${userContext.company || 'Not specified'}
- Bio: ${userContext.bio || 'Not provided'}
- Interests: ${userContext.tags.join(', ') || 'None specified'}
- Looking to connect with: ${userContext.networking_preferences.join(', ') || 'Anyone'}

Target Profile:
- Niche: ${targetContext.niche || 'Not specified'}
- Company: ${targetContext.company || 'Not specified'}
- Bio: ${targetContext.bio || 'Not provided'}
- Interests: ${targetContext.tags.join(', ') || 'None specified'}
- Looking to connect with: ${targetContext.networking_preferences.join(', ') || 'Anyone'}

Generate conversation starters as a JSON array of strings.`;

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
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    
    // Parse the JSON array from the response
    let starters;
    try {
      // Try to extract JSON array from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) || content.match(/(\[[\s\S]*?\])/);
      starters = JSON.parse(jsonMatch ? jsonMatch[1] : content);
    } catch (e) {
      console.error('Failed to parse conversation starters:', e);
      // Fallback to generic starters
      starters = [
        `Hi ${targetContext.name}! I noticed we both are interested in ${userContext.tags[0] || 'similar topics'}. What brings you to this event?`,
        `I saw your background in ${targetContext.niche || 'your field'} - I'd love to hear more about what you do!`,
        `Are you looking to connect with others in ${targetContext.networking_preferences[0] || 'the industry'}? I'd be happy to share my experience.`
      ];
    }

    return new Response(JSON.stringify({ starters }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating conversation starters:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      starters: [
        "Hi! What brings you to this event?",
        "I'd love to hear about what you're working on.",
        "Are there any sessions you're particularly excited about?"
      ]
    }), {
      status: 200, // Return 200 with fallback starters
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

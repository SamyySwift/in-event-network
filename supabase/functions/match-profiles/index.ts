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
    const { userProfile, allProfiles } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build user context
    const userContext = {
      niche: userProfile.niche,
      tags: userProfile.tags || [],
      networking_preferences: userProfile.networking_preferences || []
    };

    // Build profiles context (limited to prevent token overflow)
    const profilesContext = allProfiles.slice(0, 20).map((p: any) => ({
      id: p.id,
      name: p.name,
      niche: p.niche,
      tags: p.tags || [],
      networking_preferences: p.networking_preferences || []
    }));

    const systemPrompt = `You are an AI networking assistant that helps match attendees at events based on their profiles. Analyze profiles and return match scores (0-100) based on:
- Shared interests and tags (40% weight)
- Complementary niches and networking preferences (40% weight)
- Professional alignment (20% weight)

Return ONLY a JSON array of objects with format: [{"id": "user_id", "score": 85, "reason": "brief explanation"}]
Sort by score descending. Include only profiles with score >= 60.`;

    const userPrompt = `Match this user with other attendees:

User Profile:
- Niche: ${userContext.niche || 'Not specified'}
- Interests: ${userContext.tags.join(', ') || 'None'}
- Looking to connect with: ${userContext.networking_preferences.join(', ') || 'Anyone'}

Other Attendees:
${profilesContext.map((p: any) => `
ID: ${p.id}
Name: ${p.name}
Niche: ${p.niche || 'Not specified'}
Interests: ${p.tags?.join(', ') || 'None'}
Looking to connect: ${p.networking_preferences?.join(', ') || 'Anyone'}
`).join('\n---\n')}

Return matches as JSON array sorted by score.`;

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
    let matches;
    try {
      // Try to extract JSON array from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) || content.match(/(\[[\s\S]*?\])/);
      matches = JSON.parse(jsonMatch ? jsonMatch[1] : content);
    } catch (e) {
      console.error('Failed to parse matches:', e);
      // Fallback to simple matching based on shared tags
      matches = allProfiles
        .map((p: any) => {
          const sharedTags = (p.tags || []).filter((t: string) => 
            userContext.tags.includes(t)
          ).length;
          const sharedPrefs = (p.networking_preferences || []).filter((pref: string) =>
            userContext.networking_preferences.includes(pref)
          ).length;
          const score = (sharedTags * 10) + (sharedPrefs * 15) + (p.niche === userContext.niche ? 20 : 0);
          return {
            id: p.id,
            score: Math.min(score, 100),
            reason: score > 60 
              ? `${sharedTags} shared interests${sharedPrefs > 0 ? `, ${sharedPrefs} matching preferences` : ''}`
              : 'Limited profile overlap'
          };
        })
        .filter((m: any) => m.score >= 60)
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 10);
    }

    return new Response(JSON.stringify({ matches }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error matching profiles:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      matches: []
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

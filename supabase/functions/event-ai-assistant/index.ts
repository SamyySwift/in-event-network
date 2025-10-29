import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, eventId, action } = await req.json();
    
    if (!message || !eventId) {
      return new Response(
        JSON.stringify({ error: 'Message and eventId are required' }),
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch event context
    const { data: event } = await supabase
      .from('events')
      .select('name, description, start_date, end_date, location, event_type')
      .eq('id', eventId)
      .single();

    // Fetch schedule
    const { data: schedule } = await supabase
      .from('schedule')
      .select('title, description, start_time, end_time, location, speaker_name')
      .eq('event_id', eventId)
      .order('start_time');

    // Fetch speakers
    const { data: speakers } = await supabase
      .from('event_speakers')
      .select('name, title, bio, expertise')
      .eq('event_id', eventId);

    // Fetch announcements
    const { data: announcements } = await supabase
      .from('announcements')
      .select('title, content')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Fetch facilities
    const { data: facilities } = await supabase
      .from('event_facilities')
      .select('name, description, location, facility_type')
      .eq('event_id', eventId);

    const contextInfo = `
Event Information:
- Name: ${event?.name || 'N/A'}
- Description: ${event?.description || 'N/A'}
- Location: ${event?.location || 'N/A'}
- Type: ${event?.event_type || 'N/A'}
- Dates: ${event?.start_date || 'N/A'} to ${event?.end_date || 'N/A'}

Schedule (${schedule?.length || 0} sessions):
${schedule?.map((s: any) => `- ${s.title} (${s.start_time} - ${s.end_time})${s.speaker_name ? ` by ${s.speaker_name}` : ''} at ${s.location || 'TBD'}`).join('\n') || 'No schedule available'}

Speakers (${speakers?.length || 0} total):
${speakers?.map((sp: any) => `- ${sp.name}, ${sp.title || 'Speaker'}${sp.expertise ? ` (${sp.expertise})` : ''}`).join('\n') || 'No speakers listed'}

Recent Announcements:
${announcements?.map((a: any) => `- ${a.title}: ${a.content}`).join('\n') || 'No announcements'}

Facilities:
${facilities?.map((f: any) => `- ${f.name} (${f.facility_type}): ${f.description || 'Available'} at ${f.location || 'See map'}`).join('\n') || 'No facilities listed'}
`;

    // Handle image generation requests
    if (action === 'generate_image') {
      const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview',
          messages: [
            {
              role: 'user',
              content: message
            }
          ],
          modalities: ['image', 'text']
        })
      });

      if (!imageResponse.ok) {
        throw new Error('Failed to generate image');
      }

      const imageData = await imageResponse.json();
      const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      return new Response(
        JSON.stringify({ 
          type: 'image',
          imageUrl,
          message: imageData.choices?.[0]?.message?.content || 'Here\'s your generated image!'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Regular text response
    const systemPrompt = `You are a helpful AI assistant for the event "${event?.name || 'this event'}". 
Your role is to help attendees with:
- Information about sessions, speakers, and schedule
- Navigation and facility locations
- Networking suggestions
- Questions about the event
- General event-related inquiries

Use the context provided about the event to give accurate, helpful answers. Be friendly, concise, and actionable.
If asked to generate an image, politely tell the user to type their image request and you'll create it for them.

Current Event Context:
${contextInfo}

Important:
- For session times, be specific about start and end times
- For speakers, mention their expertise when relevant
- For locations, refer to the facilities information
- Be encouraging about networking opportunities
- Keep responses concise (2-3 sentences max unless more detail is needed)`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error('Failed to get AI response');
    }

    const aiData = await aiResponse.json();
    const reply = aiData.choices?.[0]?.message?.content || 'Sorry, I could not process your request.';

    return new Response(
      JSON.stringify({ 
        type: 'text',
        message: reply 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in event-ai-assistant:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

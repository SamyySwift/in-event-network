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

    // Fetch comprehensive event context
    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    // Fetch speakers with session details (speakers table contains schedule info)
    const { data: speakers } = await supabase
      .from('speakers')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at');

    // Fetch announcements with full details
    const { data: announcements } = await supabase
      .from('announcements')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    // Fetch facilities with full details
    const { data: facilities } = await supabase
      .from('facilities')
      .select('*')
      .eq('event_id', eventId);

    // Fetch all event participants
    const { data: participantIds } = await supabase
      .from('event_participants')
      .select('user_id')
      .eq('event_id', eventId);

    const userIds = participantIds?.map(p => p.user_id) || [];

    // Fetch attendees profiles with full details
    const { data: attendees } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    // Fetch sponsors
    const { data: sponsors } = await supabase
      .from('sponsors')
      .select('*')
      .eq('event_id', eventId);

    // Fetch rules/guidelines
    const { data: rules } = await supabase
      .from('rules')
      .select('*')
      .eq('event_id', eventId);

    // Fetch polls with votes
    const { data: polls } = await supabase
      .from('polls')
      .select('*')
      .eq('event_id', eventId);

    // Fetch questions from attendees
    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    // Fetch ticket types
    const { data: ticketTypes } = await supabase
      .from('ticket_types')
      .select('*')
      .eq('event_id', eventId);

    // Web search for event context (if event name exists)
    let webContext = '';
    if (event?.name) {
      try {
        const searchQuery = `${event.name} ${event.event_type || 'event'} ${event.location || ''}`;
        const webSearchResponse = await fetch(`https://api.tavily.com/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: Deno.env.get('TAVILY_API_KEY') || 'tvly-demo-key',
            query: searchQuery,
            search_depth: 'basic',
            max_results: 3,
          })
        });
        
        if (webSearchResponse.ok) {
          const webData = await webSearchResponse.json();
          webContext = webData.results?.map((r: any) => `- ${r.title}: ${r.content}`).join('\n') || '';
        }
      } catch (e) {
        console.log('Web search not available:', e);
      }
    }

    const contextInfo = `
EVENT DETAILS:
Name: ${event?.name || 'N/A'}
Description: ${event?.description || 'N/A'}
Location: ${event?.location || 'N/A'}
Start: ${event?.start_time || 'N/A'}
End: ${event?.end_time || 'N/A'}
Website: ${event?.website || 'N/A'}

SPEAKERS & SCHEDULE (${speakers?.length || 0} total):
${speakers?.map((sp: any) => `
• ${sp.name} - ${sp.title || 'Speaker'}
  Session: ${sp.session_title || 'TBD'}
  Time: ${sp.session_time || 'TBD'} ${sp.time_allocation ? `(${sp.time_allocation})` : ''}
  Topic: ${sp.topic || 'N/A'}
  Bio: ${sp.bio || 'N/A'}
  Company: ${sp.company || 'N/A'}
  Expertise: ${sp.expertise || 'N/A'}
  LinkedIn: ${sp.linkedin_link || 'N/A'}
  Twitter: ${sp.twitter_link || 'N/A'}
`).join('\n') || 'No speakers/sessions listed yet'}

ANNOUNCEMENTS (${announcements?.length || 0} total):
${announcements?.map((a: any) => `
• ${a.title}
  ${a.content}
  Priority: ${a.priority || 'normal'}
  Posted: ${a.created_at}
  Requires Action: ${a.require_submission ? 'Yes' : 'No'}
  Links: ${[a.website_link, a.instagram_link, a.twitter_link, a.facebook_link, a.whatsapp_link].filter(Boolean).join(', ') || 'None'}
`).join('\n') || 'No announcements yet'}

FACILITIES & VENUES (${facilities?.length || 0} total):
${facilities?.map((f: any) => `
• ${f.name} (${f.category || 'facility'})
  Type: ${f.icon_type || 'general'}
  Description: ${f.description || 'N/A'}
  Location: ${f.location || 'Check event map'}
  Contact: ${f.contact_info || 'N/A'} (${f.contact_type || 'none'})
  Rules: ${f.rules || 'Standard venue rules apply'}
`).join('\n') || 'No facilities information yet'}

ATTENDEES PROFILES (${attendees?.length || 0} registered):
${attendees?.slice(0, 50).map((a: any) => `
• ${a.full_name || a.name || 'Anonymous'}
  Email: ${a.email || 'N/A'}
  Job: ${a.job_title || 'N/A'} at ${a.organization || 'N/A'}
  Bio: ${a.bio || 'N/A'}
  Interests: ${a.interests || 'N/A'}
  Skills: ${a.skills || 'N/A'}
  LinkedIn: ${a.linkedin_url || 'N/A'}
  Looking for: ${a.looking_for || 'networking'}
`).join('\n') || 'No attendee profiles available yet'}

SPONSORS (${sponsors?.length || 0} total):
${sponsors?.map((s: any) => `
• ${s.name} - ${s.tier || 'Sponsor'}
  Description: ${s.description || 'N/A'}
  Website: ${s.website_url || 'N/A'}
  Logo: ${s.logo_url || 'N/A'}
`).join('\n') || 'No sponsors yet'}

EVENT RULES & GUIDELINES (${rules?.length || 0} items):
${rules?.map((r: any) => `
• ${r.title}
  ${r.description || 'No details'}
  Type: ${r.rule_type || 'general'}
  Category: ${r.category || 'do'}
`).join('\n') || 'No specific rules listed'}

POLLS (${polls?.length || 0} active):
${polls?.map((p: any) => `
• ${p.question}
  Options: ${Array.isArray(p.options) ? p.options.join(', ') : 'N/A'}
  Status: ${p.is_active ? 'Active' : 'Closed'}
  Show Results: ${p.show_results ? 'Yes' : 'No'}
  Banner: ${p.display_as_banner ? 'Yes' : 'No'}
`).join('\n') || 'No polls available'}

QUESTIONS FROM ATTENDEES (${questions?.length || 0} total):
${questions?.slice(0, 30).map((q: any) => `
• Q: ${q.content}
  Asked by: ${q.is_anonymous ? 'Anonymous' : 'Attendee'}
  Status: ${q.is_answered ? 'Answered' : 'Pending'}
  ${q.response ? `Answer: ${q.response}` : 'Not answered yet'}
  Upvotes: ${q.upvotes || 0}
  Session: ${q.session_id || 'General'}
`).join('\n') || 'No questions asked yet'}

TICKET TYPES (${ticketTypes?.length || 0} available):
${ticketTypes?.map((t: any) => `
• ${t.name} - ₦${t.price || 0}
  Quantity: ${t.quantity || 'Unlimited'}
  Available: ${t.available_quantity || 'N/A'}
  Description: ${t.description || 'N/A'}
  Sales: ${t.sales_start_date || 'N/A'} to ${t.sales_end_date || 'N/A'}
`).join('\n') || 'No ticket information'}

${webContext ? `\nWEB SEARCH CONTEXT:\n${webContext}\n` : ''}
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
    const systemPrompt = `You are an intelligent AI event assistant for "${event?.name || 'this event'}". Your goal is to provide comprehensive, accurate, and actionable information to attendees.

KEY CAPABILITIES:
1. Event Information: Details about timing, location, description
2. Schedule & Sessions: Session times, topics, speakers, locations
3. Speaker Information: Bios, expertise, topics they're covering
4. Networking: Match attendees based on interests, skills, job roles
5. Facilities: Locations of venues, restrooms, food areas, etc.
6. Q&A: Answer questions about the event or connect to relevant info
7. Announcements: Latest updates and important notifications
8. Polls & Engagement: Information about active polls
9. Tickets & Logistics: Ticket types, pricing, availability
10. Web Context: Use search results for historical or background info

COMPREHENSIVE EVENT CONTEXT:
${contextInfo}

RESPONSE GUIDELINES:
- Be warm, friendly, and conversational
- Give specific, actionable information (times, locations, names)
- For networking questions, suggest 2-3 specific attendees with reasons based on their profiles
- When discussing schedule, always include exact times and locations
- Reference speakers by name and mention their expertise
- For facility questions, be specific about locations and provide navigation help
- Always cite information from the event context when answering
- If information isn't available, say so clearly and suggest alternatives
- Keep responses focused but thorough (3-5 sentences typically)
- Use bullet points for lists of items
- For questions about past questions, summarize what attendees are asking about

NETWORKING STRATEGY:
When suggesting networking connections, analyze:
- Common interests and skills
- Complementary job roles
- Similar organizations or industries  
- What they're looking for (mentioned in profiles)
- Give personalized reasons why they should connect

Always be accurate and use the provided context as your source of truth.`;

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

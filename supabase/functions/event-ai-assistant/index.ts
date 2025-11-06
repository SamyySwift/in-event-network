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
    const { message, messages, eventId, action } = await req.json();
    
    // Support both single message and conversation history
    const conversationMessages = messages || [{ role: 'user', content: message }];
    
    if ((!message && !messages) || !eventId) {
      return new Response(
        JSON.stringify({ error: 'Message/messages and eventId are required' }),
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

    // Analyze query to determine if web search is needed - be more aggressive with web searches
    const lastUserMessage = conversationMessages[conversationMessages.length - 1]?.content || '';
    const messageLower = lastUserMessage.toLowerCase();
    
    // Expanded triggers for web search
    const needsDirections = messageLower.includes('direction') || messageLower.includes('how do i get') || 
                           messageLower.includes('how to get') || messageLower.includes('navigate') ||
                           messageLower.includes('way to') || messageLower.includes('way from') ||
                           messageLower.includes('location') || messageLower.includes('where is') ||
                           messageLower.includes('address');
                           
    const needsSpeakerInfo = messageLower.includes('speaker') || messageLower.includes('tell me about') ||
                             messageLower.includes('who is') || messageLower.includes('more about') ||
                             messageLower.includes('background') || messageLower.includes('biography') ||
                             messageLower.includes('career') || messageLower.includes('experience');
                             
    const needsGeneralInfo = messageLower.includes('what is') || messageLower.includes('explain') ||
                            messageLower.includes('information about') || messageLower.includes('details about') ||
                            messageLower.includes('find out') || messageLower.includes('learn about');
                            
    const needsCurrentInfo = messageLower.includes('latest') || messageLower.includes('news') ||
                            messageLower.includes('current') || messageLower.includes('recent') ||
                            messageLower.includes('trending') || messageLower.includes('update');
    
    // Only skip web search for purely internal event queries
    const isPurelyInternalQuery = (messageLower.includes('my ticket') || 
                                  messageLower.includes('poll') || 
                                  messageLower.includes('my profile')) &&
                                  !needsDirections && !needsSpeakerInfo;
    
    const needsWebSearch = !isPurelyInternalQuery && 
                          (needsDirections || needsSpeakerInfo || needsGeneralInfo || needsCurrentInfo);

    // Perform web search based on query type
    let webContext = '';
    let navigationLinks = '';
    
    if (needsWebSearch || event?.name) {
      try {
        let searchQuery = '';
        
        if (needsDirections && event?.location) {
          // Extract location mentions from the message
          searchQuery = `directions to ${event.location} ${event.name}`;
        } else if (needsSpeakerInfo) {
          // Extract speaker name from the message if possible
          const speakerNames = speakers?.map((s: any) => s.name.toLowerCase()) || [];
          const mentionedSpeaker = speakerNames.find((name: string) => messageLower.includes(name));
          searchQuery = mentionedSpeaker 
            ? `${mentionedSpeaker} speaker ${event?.name || ''} biography career achievements`
            : `${event?.name || ''} speakers information`;
        } else {
          searchQuery = `${lastUserMessage} ${event?.name || ''}`;
        }
        
        const webSearchResponse = await fetch(`https://api.tavily.com/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: Deno.env.get('TAVILY_API_KEY') || 'tvly-demo-key',
            query: searchQuery,
            search_depth: 'advanced',  // Always use advanced search for better results
            max_results: 5,  // Get more results for comprehensive answers
            include_answer: true,  // Include AI-generated answer from Tavily
          })
        });
        
        if (webSearchResponse.ok) {
          const webData = await webSearchResponse.json();
          webContext = webData.results?.map((r: any) => 
            `- ${r.title}: ${r.content}\n  Source: ${r.url}`
          ).join('\n') || '';
          
          // Generate navigation links if directions were requested
          if (needsDirections && event?.location) {
            const encodedLocation = encodeURIComponent(event.location);
            const encodedEventName = encodeURIComponent(event.name || 'event');
            navigationLinks = `\n\nNAVIGATION LINKS:
📍 Google Maps: https://www.google.com/maps/search/?api=1&query=${encodedLocation}
🚗 Uber: https://m.uber.com/looking?drop[0]=${encodedLocation}
🚕 Bolt: https://bolt.eu/
🚙 InDrive: https://indrive.com/

For Bolt and InDrive, please enter "${event.location}" as your destination in the app.`;
          }
        }
      } catch (e) {
        console.log('Web search error:', e);
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
      const lastUserMessage = conversationMessages[conversationMessages.length - 1]?.content || '';
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
              content: lastUserMessage
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
    const systemPrompt = `You are an intelligent AI event assistant for "${event?.name || 'this event'}". Your goal is to provide comprehensive, accurate, and actionable information to attendees using BOTH event data AND real-time web search results.

KEY CAPABILITIES:
1. Event Information: Details about timing, location, description
2. Schedule & Sessions: Session times, topics, speakers, locations
3. Speaker Information: Combine database info WITH web search for comprehensive speaker backgrounds
4. Networking: Match attendees based on interests, skills, job roles
5. Facilities: Locations of venues, restrooms, food areas, etc.
6. Navigation & Directions: Provide specific links to Google Maps, Uber, Bolt, and InDrive
7. Announcements: Latest updates and important notifications
8. Polls & Engagement: Information about active polls
9. Tickets & Logistics: Ticket types, pricing, availability
10. Web Intelligence: Always supplement answers with current web search results when available

COMPREHENSIVE EVENT CONTEXT:
${contextInfo}

${webContext ? `\n🌐 LIVE WEB SEARCH RESULTS (PRIORITIZE THIS FOR CURRENT/DETAILED INFO):\n${webContext}\n` : ''}

${navigationLinks ? navigationLinks : ''}

CRITICAL RESPONSE GUIDELINES:
- **FOR SPEAKER QUESTIONS**: ALWAYS combine database info with web search results. Provide detailed background, achievements, and current work from web sources
- **FOR DIRECTIONS**: ALWAYS include the navigation links provided above (Google Maps, Uber, Bolt, InDrive)
- **FOR UNKNOWN INFO**: If the event database doesn't have the answer, use web search results prominently
- Be warm, friendly, and conversational
- Give specific, actionable information (times, locations, names, links)
- When web search results are available, integrate them naturally into your response
- For speaker inquiries, provide comprehensive information beyond just the event schedule
- For navigation queries, always provide ALL the navigation links (Google Maps, Uber, Bolt, InDrive)
- If information isn't in either the database or web results, clearly state that and suggest alternatives
- Use bullet points for lists of items
- Always cite sources when using web search results

NAVIGATION INSTRUCTIONS:
When users ask "how do I get to [location]" or similar:
1. Provide directions information from web search
2. ALWAYS include the navigation links section with Google Maps, Uber, Bolt, and InDrive links
3. Explain how to use each service

SPEAKER INFORMATION PRIORITY:
1. Start with event-specific role/session from database
2. Enhance with comprehensive background from web search results
3. Include achievements, current position, expertise from web sources
4. Provide links to their social profiles from database

NETWORKING STRATEGY:
When suggesting networking connections, analyze:
- Common interests and skills
- Complementary job roles
- Similar organizations or industries  
- What they're looking for (mentioned in profiles)
- Give personalized reasons why they should connect

Always prioritize accuracy and combine event context with web intelligence for the most helpful responses.`;

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
          ...conversationMessages
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

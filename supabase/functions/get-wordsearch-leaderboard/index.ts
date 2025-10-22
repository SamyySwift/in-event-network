import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeaderboardEntry {
  user_id: string;
  points: number;
  time_seconds: number;
  completed_at: string;
  profiles: {
    name: string | null;
    photo_url: string | null;
  } | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { eventId } = await req.json();

    if (!eventId) {
      return new Response(
        JSON.stringify({ error: 'eventId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find the active game for this event
    const { data: game, error: gameError } = await supabaseAdmin
      .from('word_search_games')
      .select('id')
      .eq('event_id', eventId)
      .eq('is_active', true)
      .single();

    if (gameError || !game) {
      console.log('No active game found for event:', eventId);
      return new Response(
        JSON.stringify({ scores: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get scores first (without relying on DB relationships)
    const { data: scoresRaw, error: scoresError } = await supabaseAdmin
      .from('word_search_scores')
      .select(`
        user_id,
        points,
        time_seconds,
        completed_at
      `)
      .eq('game_id', game.id)
      .order('time_seconds', { ascending: true })
      .order('completed_at', { ascending: true })
      .limit(50);

    if (scoresError) {
      console.error('Error fetching scores:', scoresError);
      throw scoresError;
    }

    // Fetch profiles for the users in the scores
    const userIds = Array.from(new Set((scoresRaw || []).map((s) => s.user_id))).filter(Boolean);
    let profilesMap = new Map<string, { name: string | null; photo_url: string | null }>();

    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, name, photo_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      } else {
        profilesMap = new Map(profiles.map((p: any) => [p.id, { name: p.name, photo_url: p.photo_url }]));
      }
    }

    // Build leaderboard with joined profile info
    const leaderboard = (scoresRaw || []).map((entry: any) => {
      const profile = profilesMap.get(entry.user_id) || null;
      return {
        user_id: entry.user_id,
        name: profile?.name || 'Anonymous',
        photo_url: profile?.photo_url || null,
        points: entry.points,
        time_seconds: entry.time_seconds,
        completed_at: entry.completed_at,
      };
    });

    return new Response(
      JSON.stringify({ scores: leaderboard }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-wordsearch-leaderboard:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

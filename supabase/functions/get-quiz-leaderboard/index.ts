import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeaderboardEntry {
  user_id: string;
  total_score: number;
  correct_answers: number;
  total_time: number;
  completed_at: string;
  profiles: {
    name: string | null;
    photo_url: string | null;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { eventId } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // 1) Find active quiz games for the event
    const { data: quizGames, error: gamesError } = await supabaseClient
      .from('quiz_games')
      .select('id')
      .eq('event_id', eventId)
      .eq('is_active', true);

    if (gamesError) throw gamesError;
    if (!quizGames || quizGames.length === 0) {
      return new Response(
        JSON.stringify({ scores: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const quizGameIds = quizGames.map(g => g.id);

    // 2) Fetch all scores for these quiz games
    const { data: rawScores, error: scoresError } = await supabaseClient
      .from('quiz_scores')
      .select('user_id, total_score, correct_answers, total_time, completed_at, quiz_game_id')
      .in('quiz_game_id', quizGameIds)
      .order('total_score', { ascending: false })
      .order('total_time', { ascending: true });

    if (scoresError) throw scoresError;
    if (!rawScores || rawScores.length === 0) {
      return new Response(
        JSON.stringify({ scores: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3) Get unique user IDs
    const userIds = [...new Set(rawScores.map(s => s.user_id))];

    // 4) Fetch profiles for these users
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id, name, photo_url')
      .in('id', userIds);

    if (profilesError) throw profilesError;

    // 5) Keep best score per user (highest score, tie-break by lowest time)
    const bestByUser = new Map<string, any>();
    rawScores.forEach((score) => {
      const existing = bestByUser.get(score.user_id);
      if (!existing) {
        bestByUser.set(score.user_id, score);
      } else if (
        score.total_score > existing.total_score ||
        (score.total_score === existing.total_score && score.total_time < existing.total_time)
      ) {
        bestByUser.set(score.user_id, score);
      }
    });

    // 6) Join with profiles and format
    const leaderboard: LeaderboardEntry[] = Array.from(bestByUser.values())
      .map(score => {
        const profile = profiles?.find(p => p.id === score.user_id);
        return {
          user_id: score.user_id,
          total_score: score.total_score,
          correct_answers: score.correct_answers ?? 0,
          total_time: score.total_time,
          completed_at: score.completed_at,
          name: profile?.name || 'Anonymous',
          photo_url: profile?.photo_url || null,
          profiles: {
            name: profile?.name || 'Anonymous',
            photo_url: profile?.photo_url || null,
          }
        };
      })
      .sort((a, b) => {
        if (b.total_score !== a.total_score) {
          return b.total_score - a.total_score;
        }
        return a.total_time - b.total_time;
      });

    return new Response(
      JSON.stringify({ scores: leaderboard }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-quiz-leaderboard:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


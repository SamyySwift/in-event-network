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
  completed_at: string | null;
  name: string;
  photo_url: string | null;
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

    const quizGameIds = quizGames.map((g) => g.id);

    // 2) Prefer live aggregation from quiz_answers (updates per question)
    const { data: answers, error: answersError } = await supabaseClient
      .from('quiz_answers')
      .select('user_id, points_earned, is_correct, response_time, completed_at, quiz_game_id')
      .in('quiz_game_id', quizGameIds);

    if (answersError) throw answersError;

    // If no live answers yet, fallback to final scores table
    if (!answers || answers.length === 0) {
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

      const userIds = [...new Set(rawScores.map((s) => s.user_id))];
      const { data: profiles, error: profilesError } = await supabaseClient
        .from('profiles')
        .select('id, name, photo_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const leaderboard: LeaderboardEntry[] = rawScores
        .map((score) => {
          const profile = profiles?.find((p) => p.id === score.user_id);
          return {
            user_id: score.user_id,
            total_score: score.total_score,
            correct_answers: score.correct_answers ?? 0,
            total_time: score.total_time,
            completed_at: score.completed_at ?? null,
            name: profile?.name || 'Anonymous',
            photo_url: profile?.photo_url || null,
            profiles: {
              name: profile?.name || 'Anonymous',
              photo_url: profile?.photo_url || null,
            },
          };
        })
        .sort((a, b) => {
          if (b.total_score !== a.total_score) return b.total_score - a.total_score;
          return a.total_time - b.total_time;
        });

      return new Response(JSON.stringify({ scores: leaderboard }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3) Aggregate live totals from answers per user
    const totalsByUser = new Map<string, { total_score: number; correct_answers: number; total_time: number; completed_at: string | null }>();

    for (const ans of answers) {
      const existing = totalsByUser.get(ans.user_id) || { total_score: 0, correct_answers: 0, total_time: 0, completed_at: null };
      existing.total_score += ans.points_earned || 0;
      existing.total_time += ans.response_time || 0;
      if (ans.is_correct) existing.correct_answers += 1;
      totalsByUser.set(ans.user_id, existing);
    }

    const userIds = Array.from(totalsByUser.keys());

    // 4) Fetch profiles for these users
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id, name, photo_url')
      .in('id', userIds);

    if (profilesError) throw profilesError;

    // 5) Join with profiles and format
    const leaderboard: LeaderboardEntry[] = Array.from(totalsByUser.entries())
      .map(([user_id, totals]) => {
        const profile = profiles?.find((p) => p.id === user_id);
        return {
          user_id,
          total_score: totals.total_score,
          correct_answers: totals.correct_answers,
          total_time: totals.total_time,
          completed_at: null,
          name: profile?.name || 'Anonymous',
          photo_url: profile?.photo_url || null,
          profiles: {
            name: profile?.name || 'Anonymous',
            photo_url: profile?.photo_url || null,
          },
        };
      })
      .sort((a, b) => {
        if (b.total_score !== a.total_score) return b.total_score - a.total_score;
        return a.total_time - b.total_time;
      });

    return new Response(JSON.stringify({ scores: leaderboard }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-quiz-leaderboard:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


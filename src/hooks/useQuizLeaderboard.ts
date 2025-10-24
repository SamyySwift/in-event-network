import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface QuizLeaderboardEntry {
  user_id: string;
  total_score: number;
  correct_answers: number;
  total_time: number;
  name: string;
  photo_url: string | null;
}

export const useQuizLeaderboard = (eventId: string | null) => {
  const queryClient = useQueryClient();

  const { data: scores = [], isLoading } = useQuery<QuizLeaderboardEntry[]>({
    queryKey: ['quiz-leaderboard', eventId],
    queryFn: async () => {
      if (!eventId) return [];

      // 1) Get all active quiz games for the event
      const { data: quizzes, error: qErr } = await supabase
        .from('quiz_games')
        .select('id, is_active')
        .eq('event_id', eventId)
        .eq('is_active', true);

      if (qErr) throw qErr;
      if (!quizzes || quizzes.length === 0) return [];

      const quizIds = quizzes.map((q) => q.id);

      // 2) Fetch all scores for these quizzes with profile info
      const { data: rawScores, error: sErr } = await supabase
        .from('quiz_scores')
        .select(`
          user_id,
          total_score,
          total_time,
          correct_answers,
          created_at,
          profiles:user_id(name, photo_url),
          quiz_game_id
        `)
        .in('quiz_game_id', quizIds)
        .order('total_score', { ascending: false })
        .order('total_time', { ascending: true });

      if (sErr) throw sErr;

      // 3) Keep best score per user (highest score, tie-break by lowest time)
      const bestByUser = new Map<string, any>();
      (rawScores || []).forEach((r: any) => {
        const existing = bestByUser.get(r.user_id);
        if (!existing) {
          bestByUser.set(r.user_id, r);
        } else if (
          r.total_score > existing.total_score ||
          (r.total_score === existing.total_score && r.total_time < existing.total_time)
        ) {
          bestByUser.set(r.user_id, r);
        }
      });

      const leaderboard = Array.from(bestByUser.values()).sort(
        (a: any, b: any) => b.total_score - a.total_score || a.total_time - b.total_time
      );

      return leaderboard.map((r: any) => ({
        user_id: r.user_id,
        total_score: r.total_score,
        total_time: r.total_time,
        correct_answers: r.correct_answers ?? 0,
        name: r.profiles?.name || 'Anonymous',
        photo_url: r.profiles?.photo_url || null,
      }));
    },
    enabled: !!eventId,
  });

  useEffect(() => {
    // Realtime refresh for quiz scores
    const channel = supabase
      .channel('quiz-leaderboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quiz_scores' },
        () => {
          if (eventId) {
            queryClient.invalidateQueries({ queryKey: ['quiz-leaderboard', eventId] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, queryClient]);

  return { scores, isLoading };
};

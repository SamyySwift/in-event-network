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
      const { data, error } = await supabase.functions.invoke('get-quiz-leaderboard', {
        body: { eventId },
      });
      if (error) throw error;
      return (data?.scores ?? []) as QuizLeaderboardEntry[];
    },
    enabled: !!eventId,
    refetchInterval: eventId ? 1500 : false,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  useEffect(() => {
    // Realtime refresh for quiz answers (live updates)
    const channel = supabase
      .channel('quiz-leaderboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quiz_responses' },
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

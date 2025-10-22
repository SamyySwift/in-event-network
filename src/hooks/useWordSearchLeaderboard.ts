import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardEntry {
  user_id: string;
  points: number;
  time_seconds: number;
  completed_at: string;
  name: string;
  photo_url: string | null;
}

export const useWordSearchLeaderboard = (eventId: string | null) => {
  const queryClient = useQueryClient();

  const { data: scores = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['word-search-leaderboard', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const { data, error } = await supabase.functions.invoke('get-wordsearch-leaderboard', {
        body: { eventId },
      });
      if (error) throw error;
      return (data?.scores ?? []) as LeaderboardEntry[];
    },
    enabled: !!eventId,
  });

  useEffect(() => {
    // Lightweight realtime refresh when any score changes
    const channel = supabase
      .channel('word-search-leaderboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'word_search_scores' },
        () => {
          if (eventId) {
            queryClient.invalidateQueries({ queryKey: ['word-search-leaderboard', eventId] });
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

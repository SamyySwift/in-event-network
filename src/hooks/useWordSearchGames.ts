import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WordSearchGame {
  id: string;
  event_id: string;
  title: string;
  words: string[];
  grid_size: number;
  grid_data: any;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface WordSearchScore {
  id: string;
  game_id: string;
  user_id: string;
  time_seconds: number;
  points: number;
  completed_at: string;
}

export const useWordSearchGames = (eventId: string | null) => {
  const queryClient = useQueryClient();

  const { data: games = [], isLoading } = useQuery({
    queryKey: ['word-search-games', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('word_search_games')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WordSearchGame[];
    },
    enabled: !!eventId,
  });

  const createGame = useMutation({
    mutationFn: async (gameData: {
      event_id: string;
      title: string;
      words: string[];
      grid_size: number;
      grid_data: any;
    }) => {
      const { data, error } = await supabase
        .from('word_search_games')
        .insert([gameData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['word-search-games'] });
      toast.success('Word search game created successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to create game: ' + error.message);
    },
  });

  const updateGame = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WordSearchGame> & { id: string }) => {
      const { data, error } = await supabase
        .from('word_search_games')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['word-search-games'] });
      toast.success('Game updated successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to update game: ' + error.message);
    },
  });

  const deleteGame = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('word_search_games')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['word-search-games'] });
      toast.success('Game deleted successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to delete game: ' + error.message);
    },
  });

  return {
    games,
    isLoading,
    createGame,
    updateGame,
    deleteGame,
  };
};

export const useWordSearchScores = (gameId: string | null) => {
  const queryClient = useQueryClient();

  const { data: scores = [], isLoading } = useQuery({
    queryKey: ['word-search-scores', gameId],
    queryFn: async () => {
      if (!gameId) return [];
      
      const { data, error } = await supabase
        .from('word_search_scores')
        .select(`
          *,
          profiles:user_id (
            name,
            photo_url
          )
        `)
        .eq('game_id', gameId)
        .order('points', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!gameId,
  });

  const submitScore = useMutation({
    mutationFn: async (scoreData: {
      game_id: string;
      user_id: string;
      time_seconds: number;
      points: number;
    }) => {
      const { data, error } = await supabase
        .from('word_search_scores')
        .upsert([scoreData], { onConflict: 'game_id,user_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['word-search-scores'] });
      toast.success('Score submitted successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to submit score: ' + error.message);
    },
  });

  return {
    scores,
    isLoading,
    submitScore,
  };
};

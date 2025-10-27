import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface QuizQuestion {
  id?: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  time_limit: number;
  question_order: number;
}

export interface QuizGame {
  id: string;
  event_id: string;
  title: string;
  description?: string;
  is_active: boolean;
  total_questions: number;
  created_at: string;
  created_by?: string;
}

export const useQuizGames = (eventId: string | null) => {
  const queryClient = useQueryClient();

  const { data: quizGames = [], isLoading } = useQuery({
    queryKey: ['quiz-games', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const { data, error } = await supabase
        .from('quiz_games')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as QuizGame[];
    },
    enabled: !!eventId,
  });

  const createQuizGame = useMutation({
    mutationFn: async (quiz: Omit<QuizGame, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('quiz_games')
        .insert([quiz])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-games', eventId] });
      toast.success('Quiz game created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create quiz game');
      console.error(error);
    },
  });

  const updateQuizGame = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<QuizGame> }) => {
      const { data, error } = await supabase
        .from('quiz_games')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-games', eventId] });
      toast.success('Quiz game updated!');
    },
    onError: (error) => {
      toast.error('Failed to update quiz game');
      console.error(error);
    },
  });

  const deleteQuizGame = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('quiz_games').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-games', eventId] });
      toast.success('Quiz game deleted!');
    },
    onError: (error) => {
      toast.error('Failed to delete quiz game');
      console.error(error);
    },
  });

  return {
    quizGames,
    isLoading,
    createQuizGame,
    updateQuizGame,
    deleteQuizGame,
  };
};

export const useQuizQuestions = (quizGameId: string | null) => {
  const queryClient = useQueryClient();

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['quiz-questions', quizGameId],
    queryFn: async () => {
      if (!quizGameId) return [];
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_game_id', quizGameId)
        .order('question_order', { ascending: true });

      if (error) throw error;
      return data as QuizQuestion[];
    },
    enabled: !!quizGameId,
  });

  const addQuestion = useMutation({
    mutationFn: async (question: Omit<QuizQuestion, 'id'> & { quiz_game_id: string }) => {
      const { data, error } = await supabase
        .from('quiz_questions')
        .insert([question])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions', quizGameId] });
      toast.success('Question added!');
    },
  });

  const deleteQuestion = useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase.from('quiz_questions').delete().eq('id', questionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions', quizGameId] });
      toast.success('Question deleted!');
    },
  });

  return {
    questions,
    isLoading,
    addQuestion,
    deleteQuestion,
  };
};

export const useQuizScores = (quizGameId: string | null) => {
  const queryClient = useQueryClient();

  const { data: scores = [], isLoading } = useQuery({
    queryKey: ['quiz-scores', quizGameId],
    queryFn: async () => {
      if (!quizGameId) return [];
      const { data, error } = await supabase
        .from('quiz_scores')
        .select(`
          *,
          profiles:user_id (
            name,
            photo_url
          )
        `)
        .eq('quiz_game_id', quizGameId)
        .order('total_score', { ascending: false })
        .order('total_time', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!quizGameId,
  });

  // Real-time subscription for score updates
  useEffect(() => {
    if (!quizGameId) return;

    const channel = supabase
      .channel('quiz-scores-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_scores',
          filter: `quiz_game_id=eq.${quizGameId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['quiz-scores', quizGameId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [quizGameId, queryClient]);

  const submitScore = useMutation({
    mutationFn: async (scoreData: {
      quiz_game_id: string;
      user_id: string;
      total_score: number;
      correct_answers: number;
      total_time: number;
    }) => {
      const payload = {
        ...scoreData,
        completed_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from('quiz_scores')
        .upsert([payload], { onConflict: 'quiz_game_id,user_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-scores', quizGameId] });
      // Also refresh any event-level quiz leaderboards
      queryClient.invalidateQueries({ queryKey: ['quiz-leaderboard'] });
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

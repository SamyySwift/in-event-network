import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface QuizSession {
  id: string;
  quiz_game_id: string;
  event_id: string;
  current_question_index: number;
  is_active: boolean;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useQuizSession = (quizGameId: string | null, eventId: string | null) => {
  const queryClient = useQueryClient();

  // Fetch active session for quiz game
  const { data: session, isLoading } = useQuery<QuizSession | null>({
    queryKey: ['quiz-session', quizGameId],
    queryFn: async () => {
      if (!quizGameId) return null;
      
      const { data, error } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('quiz_game_id', quizGameId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!quizGameId,
  });

  // Start quiz session
  const startSession = useMutation({
    mutationFn: async ({ quizGameId, eventId }: { quizGameId: string; eventId: string }) => {
      // End any existing active sessions for this quiz
      await supabase
        .from('quiz_sessions')
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq('quiz_game_id', quizGameId)
        .eq('is_active', true);

      // Create new session
      const { data, error } = await supabase
        .from('quiz_sessions')
        .insert({
          quiz_game_id: quizGameId,
          event_id: eventId,
          current_question_index: 0,
          is_active: true,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-session', quizGameId] });
    },
  });

  // Next question
  const nextQuestion = useMutation({
    mutationFn: async ({ sessionId, currentIndex }: { sessionId: string; currentIndex: number }) => {
      const { data, error } = await supabase
        .from('quiz_sessions')
        .update({ 
          current_question_index: currentIndex + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-session', quizGameId] });
    },
  });

  // End session
  const endSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase
        .from('quiz_sessions')
        .update({ 
          is_active: false, 
          ended_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-session', quizGameId] });
    },
  });

  // Real-time subscription
  useEffect(() => {
    if (!quizGameId) return;

    const channel = supabase
      .channel('quiz-session-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_sessions',
          filter: `quiz_game_id=eq.${quizGameId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['quiz-session', quizGameId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [quizGameId, queryClient]);

  return {
    session,
    isLoading,
    startSession,
    nextQuestion,
    endSession,
  };
};

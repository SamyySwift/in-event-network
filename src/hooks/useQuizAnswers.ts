import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface QuizAnswerSubmission {
  quiz_game_id: string;
  question_id: string;
  user_id: string;
  selected_answer: string;
  is_correct: boolean;
  time_taken: number;
}

export const useQuizAnswers = () => {
  const queryClient = useQueryClient();

  const submitAnswer = useMutation({
    mutationFn: async (answerData: QuizAnswerSubmission) => {
      const { data, error } = await supabase
        .from('quiz_responses')
        .insert([answerData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate leaderboard queries to trigger real-time updates
      queryClient.invalidateQueries({ queryKey: ['quiz-leaderboard'] });
    },
    onError: (error: any) => {
      console.error('Failed to submit quiz answer:', error);
      toast.error('Failed to save your answer');
    },
  });

  return {
    submitAnswer,
  };
};

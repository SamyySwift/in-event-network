
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface QuestionWithProfile {
  id: string;
  content: string;
  created_at: string;
  upvotes: number;
  is_answered: boolean;
  user_id: string;
  session_id: string | null;
  event_id: string | null;
  is_anonymous: boolean;
  answered_at: string | null;
  answered_by: string | null;
  response: string | null;
  profiles: {
    name: string;
    photo_url: string | null;
  } | null;
}

export const useAdminQuestions = (eventId?: string) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: questions = [], isLoading, error } = useQuery({
    queryKey: ['admin-questions', currentUser?.id, eventId],
    queryFn: async (): Promise<QuestionWithProfile[]> => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      if (!eventId) {
        return [];
      }

      console.log('Fetching questions for admin:', currentUser.id, 'event:', eventId);

      // Get questions from participants of the admin's event
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (questionsError) {
        console.error('Questions error:', questionsError);
        throw questionsError;
      }

      console.log('Admin questions data:', questionsData);

      if (!questionsData || questionsData.length === 0) {
        return [];
      }

      // Get profiles for non-anonymous questions
      const questionsWithProfiles = await Promise.all(
        questionsData.map(async (question) => {
          if (question.is_anonymous) {
            return {
              ...question,
              profiles: null
            };
          }

          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('name, photo_url')
              .eq('id', question.user_id)
              .single();

            if (profileError) {
              console.warn('Profile error for user:', question.user_id, profileError);
              return {
                ...question,
                profiles: null
              };
            }

            return {
              ...question,
              profiles: profileData
            };
          } catch (error) {
            console.warn('Error fetching profile for user:', question.user_id, error);
            return {
              ...question,
              profiles: null
            };
          }
        })
      );

      console.log('Admin questions with profiles:', questionsWithProfiles);
      return questionsWithProfiles;
    },
    enabled: !!currentUser?.id && !!eventId,
  });

  const markAsAnsweredMutation = useMutation({
    mutationFn: async (questionId: string) => {
      console.log('Marking question as answered:', questionId);
      
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('questions')
        .update({ 
          is_answered: true,
          answered_at: new Date().toISOString(),
          answered_by: currentUser.id
        })
        .eq('id', questionId);

      if (error) {
        console.error('Error marking question as answered:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
      toast({
        title: 'Success',
        description: 'Question marked as answered',
      });
    },
    onError: (error: any) => {
      console.error('Error updating question:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update question',
        variant: 'destructive',
      });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      console.log('Deleting question:', questionId);
      
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) {
        console.error('Error deleting question:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
      toast({
        title: 'Success',
        description: 'Question deleted successfully',
      });
    },
    onError: (error: any) => {
      console.error('Error deleting question:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete question',
        variant: 'destructive',
      });
    },
  });

  const respondToQuestionMutation = useMutation({
    mutationFn: async ({ questionId, response }: { questionId: string; response: string }) => {
      console.log('Responding to question:', questionId, response);
      
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('questions')
        .update({ 
          response: response,
          response_created_at: new Date().toISOString(),
          is_answered: true,
          answered_at: new Date().toISOString(),
          answered_by: currentUser.id
        })
        .eq('id', questionId);

      if (error) {
        console.error('Error responding to question:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
      toast({
        title: 'Success',
        description: 'Response submitted successfully',
      });
    },
    onError: (error: any) => {
      console.error('Error responding to question:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit response',
        variant: 'destructive',
      });
    },
  });

  return {
    questions,
    isLoading,
    error,
    markAsAnswered: markAsAnsweredMutation.mutate,
    deleteQuestion: deleteQuestionMutation.mutate,
    respondToQuestion: respondToQuestionMutation.mutate,
    isMarkingAnswered: markAsAnsweredMutation.isPending,
    isDeleting: deleteQuestionMutation.isPending,
    isResponding: respondToQuestionMutation.isPending,
  };
};

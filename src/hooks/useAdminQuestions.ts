import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { getCache, setCache, slowNetworkQueryOptions } from '@/utils/queryCache';

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
  response_created_at: string | null;
  profiles: {
    name: string;
    photo_url: string | null;
  } | null;
  session_info: {
    session_title: string | null;
    speaker_name: string;
    session_time: string | null;
  } | null;
  event_name?: string;
  is_panelist?: boolean;
  panelist_name?: string | null;
}

const CACHE_KEY = 'admin-questions';

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

      let questionsData;
      let questionsError;

      if (eventId) {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('event_id', eventId)
          .order('created_at', { ascending: false });

        questionsData = data;
        questionsError = error;
      } else {
        const { data: adminEvents, error: eventsError } = await supabase
          .from('events')
          .select('id, name')
          .eq('host_id', currentUser.id);

        if (eventsError) throw eventsError;

        if (!adminEvents || adminEvents.length === 0) {
          return [];
        }

        const eventIds = adminEvents.map(event => event.id);

        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .in('event_id', eventIds)
          .order('created_at', { ascending: false });

        questionsData = data;
        questionsError = error;
      }

      if (questionsError) throw questionsError;

      if (!questionsData || questionsData.length === 0) {
        return [];
      }

      // Manually fetch user profiles for the questions
      const userIds = questionsData.map((q: any) => q.user_id).filter(Boolean);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, photo_url')
        .in('id', userIds);

      // Manually fetch event names if needed
      let eventsMap: Record<string, string> = {};
      if (!eventId) {
        const eventIds = questionsData.map((q: any) => q.event_id).filter(Boolean);
        const { data: events } = await supabase
          .from('events')
          .select('id, name')
          .in('id', eventIds);

        if (events) {
          eventsMap = events.reduce((acc, event) => {
            acc[event.id] = event.name;
            return acc;
          }, {} as Record<string, string>);
        }
      }

      // Process questions with session information and user profiles
      const questionsWithSessionInfo = await Promise.all(
        questionsData.map(async (question: any) => {
          let sessionInfo = null;
          
          if (question.session_id) {
            const { data: speakerData } = await supabase
              .from('speakers')
              .select('name, session_title, session_time')
              .eq('id', question.session_id)
              .single();
            
            if (speakerData) {
              sessionInfo = {
                session_title: speakerData.session_title,
                speaker_name: speakerData.name,
                session_time: speakerData.session_time
              };
            }
          }

          const userProfile = profiles?.find(p => p.id === question.user_id);

          let isPanelist = false;
          let panelistName = null;
          if (question.user_id && question.event_id) {
            const { data: speakerData } = await supabase
              .from('speakers')
              .select('name')
              .eq('event_id', question.event_id)
              .eq('created_by', question.user_id)
              .single();
            
            if (speakerData) {
              isPanelist = true;
              panelistName = speakerData.name;
            }
          }

          return {
            ...question,
            profiles: question.is_anonymous ? null : (userProfile ? {
              name: userProfile.name || 'Unknown User',
              photo_url: userProfile.photo_url
            } : null),
            session_info: sessionInfo,
            event_name: eventsMap[question.event_id] || 'Unknown Event',
            is_panelist: isPanelist,
            panelist_name: panelistName
          };
        })
      );

      setCache(`${CACHE_KEY}-${currentUser.id}-${eventId || 'all'}`, questionsWithSessionInfo);
      return questionsWithSessionInfo;
    },
    enabled: !!currentUser?.id,
    placeholderData: () => getCache<QuestionWithProfile[]>(`${CACHE_KEY}-${currentUser?.id}-${eventId || 'all'}`) || [],
    ...slowNetworkQueryOptions,
  });

  // Set up real-time subscription for questions with debouncing
  useEffect(() => {
    if (!currentUser?.id) return;

    let debounceTimer: NodeJS.Timeout;
    const debouncedInvalidate = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['admin-questions', currentUser.id] });
      }, 2000);
    };

    const channel = supabase
      .channel('questions-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'questions' },
        debouncedInvalidate
      )
      .subscribe();

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, eventId, queryClient]);

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
      queryClient.invalidateQueries({ queryKey: ['attendee-questions'] });
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
      queryClient.invalidateQueries({ queryKey: ['attendee-questions'] });
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
      queryClient.invalidateQueries({ queryKey: ['attendee-questions'] });
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

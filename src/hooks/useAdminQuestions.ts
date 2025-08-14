import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

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

      console.log('Fetching questions for admin:', currentUser.id, 'event:', eventId);

      try {
        let questionsData;
        let questionsError;

        if (eventId) {
          // Get questions for specific event
          console.log('Fetching questions for specific event:', eventId);
          const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('event_id', eventId)
            .order('created_at', { ascending: false });

          questionsData = data;
          questionsError = error;
          console.log('Event-specific questions result:', { data, error });
        } else {
          // Get all admin's events first
          console.log('Fetching all admin events for user:', currentUser.id);
          const { data: adminEvents, error: eventsError } = await supabase
            .from('events')
            .select('id, name')
            .eq('host_id', currentUser.id);

          console.log('Admin events result:', { adminEvents, eventsError });

          if (eventsError) {
            console.error('Error fetching admin events:', eventsError);
            throw eventsError;
          }

          if (!adminEvents || adminEvents.length === 0) {
            console.log('No events found for admin');
            return [];
          }

          const eventIds = adminEvents.map(event => event.id);
          console.log('Event IDs to fetch questions for:', eventIds);

          // Get questions from all admin events
          const { data, error } = await supabase
            .from('questions')
            .select('*')
            .in('event_id', eventIds)
            .order('created_at', { ascending: false });

          questionsData = data;
          questionsError = error;
          console.log('All events questions result:', { data, error });
        }

        if (questionsError) {
          console.error('Questions error:', questionsError);
          throw questionsError;
        }

        console.log('Raw questions data:', questionsData);

        if (!questionsData || questionsData.length === 0) {
          console.log('No questions found');
          return [];
        }

        // Manually fetch user profiles for the questions
        const userIds = questionsData.map((q: any) => q.user_id).filter(Boolean);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, photo_url')
          .in('id', userIds);

        console.log('Fetched profiles:', profiles);

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
              console.log('Fetching session info for session_id:', question.session_id);
              const { data: speakerData, error: speakerError } = await supabase
                .from('speakers')
                .select('name, session_title, session_time')
                .eq('id', question.session_id)
                .single();
              
              if (speakerError) {
                console.error('Error fetching speaker data:', speakerError);
              } else if (speakerData) {
                sessionInfo = {
                  session_title: speakerData.session_title,
                  speaker_name: speakerData.name,
                  session_time: speakerData.session_time
                };
              }
            }

            // Find the user profile for this question
            const userProfile = profiles?.find(p => p.id === question.user_id);

            // Check if the user is a speaker/panelist for this event
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

            const processedQuestion = {
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

            console.log('Processed question:', processedQuestion);
            return processedQuestion;
          })
        );

        console.log('Final questions with session info:', questionsWithSessionInfo);
        return questionsWithSessionInfo;
      } catch (error) {
        console.error('Error in useAdminQuestions:', error);
        throw error;
      }
    },
    enabled: !!currentUser?.id,
  });

  // Set up real-time subscription for questions
  useEffect(() => {
    if (!currentUser?.id) return;

    console.log('Setting up real-time subscription for questions');

    const channel = supabase
      .channel('questions-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'questions'
        },
        (payload) => {
          console.log('New question received:', payload);
          
          // Check if this question is for events that the current admin hosts
          if (eventId) {
            // If we're viewing a specific event, only update if the new question is for this event
            if (payload.new.event_id === eventId) {
              queryClient.invalidateQueries({ queryKey: ['admin-questions', currentUser.id, eventId] });
            }
          } else {
            // If viewing all events, we need to check if this question belongs to any of the admin's events
            // For now, we'll invalidate all queries and let the existing logic filter appropriately
            queryClient.invalidateQueries({ queryKey: ['admin-questions', currentUser.id] });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'questions'
        },
        (payload) => {
          console.log('Question updated:', payload);
          
          // Invalidate queries to reflect updates (like when marked as answered or response added)
          if (eventId && payload.new.event_id === eventId) {
            queryClient.invalidateQueries({ queryKey: ['admin-questions', currentUser.id, eventId] });
          } else if (!eventId) {
            queryClient.invalidateQueries({ queryKey: ['admin-questions', currentUser.id] });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'questions'
        },
        (payload) => {
          console.log('Question deleted:', payload);
          
          // Invalidate queries to reflect deletions
          if (eventId && payload.old.event_id === eventId) {
            queryClient.invalidateQueries({ queryKey: ['admin-questions', currentUser.id, eventId] });
          } else if (!eventId) {
            queryClient.invalidateQueries({ queryKey: ['admin-questions', currentUser.id] });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
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


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

interface Question {
  id: string;
  content: string;
  user_id?: string;
  event_id?: string;
  session_id?: string;
  is_anonymous: boolean;
  is_answered: boolean;
  response?: string;
  upvotes: number;
  answered_at?: string;
  answered_by?: string;
  response_created_at?: string;
  created_at: string;
  updated_at: string;
}

export const useQuestions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  // Set up real-time subscription for questions
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('questions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'questions'
        },
        (payload) => {
          console.log('Questions real-time update:', payload);
          queryClient.invalidateQueries({ queryKey: ['questions'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, queryClient]);

  const { data: questions = [], isLoading, error } = useQuery({
    queryKey: ['questions', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) {
        return [];
      }

      try {
        if (currentUser.role === 'attendee') {
          // Get the current user's profile to find their current event
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('current_event_id')
            .eq('id', currentUser.id)
            .single();

          if (profileError || !profile?.current_event_id) {
            console.error('Error fetching profile or no current event:', profileError);
            return [];
          }

          // Get the current event to find the host
          const { data: currentEvent, error: eventError } = await supabase
            .from('events')
            .select('host_id')
            .eq('id', profile.current_event_id)
            .single();

          if (eventError || !currentEvent?.host_id) {
            console.error('Error fetching current event:', eventError);
            return [];
          }

          // Get all events from the same host
          const { data: hostEvents, error: hostEventsError } = await supabase
            .from('events')
            .select('id')
            .eq('host_id', currentEvent.host_id);

          if (hostEventsError) {
            console.error('Error fetching host events:', hostEventsError);
            return [];
          }

          const eventIds = hostEvents?.map(e => e.id) || [];
          if (eventIds.length === 0) {
            return [];
          }

          // Get questions from the host's events only
          const { data, error } = await supabase
            .from('questions')
            .select('*')
            .in('event_id', eventIds)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching questions:', error);
            throw error;
          }
          return data as Question[];
        } else if (currentUser.role === 'host') {
          // Hosts see questions from their own events
          const { data: hostEvents } = await supabase
            .from('events')
            .select('id')
            .eq('host_id', currentUser.id);

          const eventIds = hostEvents?.map(e => e.id) || [];
          if (eventIds.length === 0) {
            return [];
          }

          const { data, error } = await supabase
            .from('questions')
            .select('*')
            .in('event_id', eventIds)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching questions:', error);
            throw error;
          }
          return data as Question[];
        }

        return [];
      } catch (error) {
        console.log('Questions functionality not available:', error);
        return [];
      }
    },
    enabled: !!currentUser,
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: Omit<Question, 'id' | 'created_at' | 'updated_at' | 'upvotes' | 'is_answered'>) => {
      if (!currentUser) {
        throw new Error('You must be logged in to ask questions');
      }

      // Get the current event for attendees
      let eventId = questionData.event_id;
      if (currentUser.role === 'attendee') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('current_event_id')
          .eq('id', currentUser.id)
          .single();
        
        eventId = profile?.current_event_id;
      }

      const { data, error } = await supabase
        .from('questions')
        .insert([{
          ...questionData,
          event_id: eventId,
          user_id: questionData.is_anonymous ? null : currentUser.id,
          upvotes: 0,
          is_answered: false,
        }])
        .select()
        .single();

      if (error) {
        console.error('Create question error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast({
        title: 'Question Submitted',
        description: 'Your question has been submitted successfully.',
      });
    },
    onError: (error) => {
      console.error('Create question error:', error);
      toast({
        title: 'Error',
        description: `Failed to submit question: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const answerQuestionMutation = useMutation({
    mutationFn: async ({ id, response }: { id: string; response: string }) => {
      if (!currentUser || currentUser.role !== 'host') {
        throw new Error('Only hosts can answer questions');
      }

      const { data, error } = await supabase
        .from('questions')
        .update({
          response,
          is_answered: true,
          answered_by: currentUser.id,
          answered_at: new Date().toISOString(),
          response_created_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Answer question error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast({
        title: 'Question Answered',
        description: 'The question has been answered successfully.',
      });
    },
    onError: (error) => {
      console.error('Answer question error:', error);
      toast({
        title: 'Error',
        description: `Failed to answer question: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const upvoteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      if (!currentUser) {
        throw new Error('You must be logged in to upvote questions');
      }

      // Get current upvotes
      const { data: question, error: fetchError } = await supabase
        .from('questions')
        .select('upvotes')
        .eq('id', questionId)
        .single();

      if (fetchError) throw fetchError;

      // Update upvotes
      const { data, error } = await supabase
        .from('questions')
        .update({ upvotes: (question.upvotes || 0) + 1 })
        .eq('id', questionId)
        .select()
        .single();

      if (error) {
        console.error('Upvote question error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast({
        title: 'Question Upvoted',
        description: 'You have upvoted this question.',
      });
    },
    onError: (error) => {
      console.error('Upvote question error:', error);
      toast({
        title: 'Error',
        description: `Failed to upvote question: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    questions,
    isLoading,
    error,
    createQuestion: createQuestionMutation.mutate,
    answerQuestion: answerQuestionMutation.mutate,
    upvoteQuestion: upvoteQuestionMutation.mutate,
    isCreating: createQuestionMutation.isPending,
    isAnswering: answerQuestionMutation.isPending,
    isUpvoting: upvoteQuestionMutation.isPending,
  };
};

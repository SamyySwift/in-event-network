import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface QuestionWithProfile {
  id: string;
  content: string;
  created_at: string;
  upvotes: number;
  is_answered: boolean;
  user_id: string;
  session_id: string | null;
  event_id: string | null;
  is_anonymous: boolean;
  profiles: {
    name: string;
    photo_url: string | null;
  } | null;
}

interface Session {
  id: string;
  name: string;
  session_title: string | null;
  session_time: string | null;
}

export const useAttendeeQuestions = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Add a helper to check event participation
  const isParticipantQuery = useQuery({
    queryKey: ['is-participant', currentUser?.id, currentEventId],
    queryFn: async (): Promise<boolean> => {
      if (!currentUser?.id || !currentEventId) return false;

      const { data, error } = await supabase
        .from('event_participants')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('event_id', currentEventId)
        .maybeSingle();

      return !!data;
    },
    enabled: !!currentUser?.id && !!currentEventId,
  });

  const { data: currentEventId } = useQuery({
    queryKey: ['current-event-id', currentUser?.id],
    queryFn: async (): Promise<string | null> => {
      if (!currentUser?.id) return null;

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('current_event_id')
        .eq('id', currentUser.id)
        .single();

      return userProfile?.current_event_id || null;
    },
    enabled: !!currentUser?.id,
  });

  const { data: questions = [], isLoading: questionsLoading, error: questionsError } = useQuery({
    queryKey: ['attendee-questions', currentUser?.id, currentEventId],
    queryFn: async (): Promise<QuestionWithProfile[]> => {
      if (!currentUser?.id || !currentEventId) {
        return [];
      }

      // Get the current event to find the host
      const { data: currentEvent } = await supabase
        .from('events')
        .select('host_id')
        .eq('id', currentEventId)
        .single();

      if (!currentEvent?.host_id) {
        return [];
      }

      // Get all events from the same host
      const { data: hostEvents } = await supabase
        .from('events')
        .select('id')
        .eq('host_id', currentEvent.host_id);

      const eventIds = hostEvents?.map(e => e.id) || [];

      if (eventIds.length === 0) {
        return [];
      }

      // Get questions from users who have joined events from this host
      const { data: eventParticipants } = await supabase
        .from('event_participants')
        .select('user_id')
        .in('event_id', eventIds);

      const participantIds = eventParticipants?.map(p => p.user_id) || [];

      if (participantIds.length === 0) {
        return [];
      }

      // Get questions from these participants for the current event
      const { data: questionsData, error } = await supabase
        .from('questions')
        .select('*')
        .in('user_id', participantIds)
        .eq('event_id', currentEventId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching attendee questions:', error);
        throw error;
      }

      // Fetch profiles for each question
      const questionsWithProfiles = await Promise.all(
        (questionsData || []).map(async (question) => {
          if (question.is_anonymous) {
            return {
              ...question,
              profiles: null
            };
          }

          const { data: profile } = await supabase
            .from('profiles')
            .select('name, photo_url')
            .eq('id', question.user_id)
            .single();

          return {
            ...question,
            profiles: profile
          };
        })
      );

      return questionsWithProfiles;
    },
    enabled: !!currentUser?.id && !!currentEventId,
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['attendee-sessions', currentUser?.id, currentEventId],
    queryFn: async (): Promise<Session[]> => {
      if (!currentUser?.id || !currentEventId) {
        return [];
      }

      // Get speakers/sessions for the current event
      const { data: sessionsData, error } = await supabase
        .from('speakers')
        .select('id, name, session_title, session_time')
        .eq('event_id', currentEventId)
        .not('session_time', 'is', null)
        .not('session_title', 'is', null)
        .order('session_time', { ascending: true });

      if (error) {
        console.error('Error fetching attendee sessions:', error);
        throw error;
      }

      return sessionsData || [];
    },
    enabled: !!currentUser?.id && !!currentEventId,
  });

  const submitQuestionMutation = useMutation({
    mutationFn: async (questionData: {
      content: string;
      isAnonymous: boolean;
      selectedSessionId: string;
    }) => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      if (!currentEventId) {
        throw new Error('No current event found');
      }

      // Check if attendee is actually part of the event
      const { data: participant, error: participantError } = await supabase
        .from('event_participants')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('event_id', currentEventId)
        .maybeSingle();

      if (participantError) {
        // log and throw for debug
        console.error('Error checking event participant:', participantError);
        throw new Error('Could not check event participation');
      }

      if (!participant) {
        throw new Error('You must join the event to submit questions.');
      }

      const { error } = await supabase
        .from('questions')
        .insert([{
          content: questionData.content.trim(),
          user_id: currentUser.id,
          is_anonymous: questionData.isAnonymous,
          session_id: questionData.selectedSessionId === 'general' ? null : questionData.selectedSessionId || null,
          event_id: currentEventId,
          upvotes: 0,
          is_answered: false
        }]);

      if (error) {
        // Enhanced debug: output all supabase error fields
        console.error('Error submitting question:');
        console.error('Message:', error.message);
        if (error.details) console.error('Details:', error.details);
        if (error.hint) console.error('Hint:', error.hint);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendee-questions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
      toast({
        title: "Success",
        description: "Your question has been submitted!",
      });
    },
    onError: (error: any) => {
      console.error('Failed to submit question:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to submit question",
        variant: "destructive",
      });
    },
  });

  const upvoteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      // Get current upvotes
      const { data: question, error: fetchError } = await supabase
        .from('questions')
        .select('upvotes')
        .eq('id', questionId)
        .single();

      if (fetchError) throw fetchError;

      // Update upvotes
      const { error } = await supabase
        .from('questions')
        .update({ upvotes: question.upvotes + 1 })
        .eq('id', questionId);

      if (error) throw error;

      return questionId;
    },
    onSuccess: (questionId) => {
      queryClient.invalidateQueries({ queryKey: ['attendee-questions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
      toast({
        title: "Success",
        description: "Question upvoted!",
      });
    },
    onError: (error: any) => {
      console.error('Error upvoting question:', error);
      toast({
        title: "Error",
        description: "Failed to upvote question",
        variant: "destructive",
      });
    },
  });

  return {
    questions,
    sessions,
    currentEventId,
    isLoading: questionsLoading || sessionsLoading,
    error: questionsError,
    submitQuestion: submitQuestionMutation.mutate,
    upvoteQuestion: upvoteQuestionMutation.mutate,
    isSubmitting: submitQuestionMutation.isPending,
    isParticipant: isParticipantQuery.data,
    isParticipantLoading: isParticipantQuery.isLoading,
  };
};

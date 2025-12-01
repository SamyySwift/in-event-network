import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getCache, setCache, slowNetworkQueryOptions } from '@/utils/queryCache';

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
  profiles: { name: string; photo_url: string | null } | null;
}

interface Session {
  id: string;
  name: string;
  session_title: string | null;
  session_time: string | null;
}

const CACHE_KEY = 'attendee-questions';

export const useAttendeeQuestions = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentEventId } = useQuery({
    queryKey: ['current-event-id', currentUser?.id],
    queryFn: async (): Promise<string | null> => {
      if (!currentUser?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('current_event_id')
        .eq('id', currentUser.id)
        .single();
      return data?.current_event_id || null;
    },
    enabled: !!currentUser?.id,
    ...slowNetworkQueryOptions,
  });

  const isParticipantQuery = useQuery({
    queryKey: ['is-participant', currentUser?.id, currentEventId],
    queryFn: async (): Promise<boolean> => {
      if (!currentUser?.id || !currentEventId) return false;
      const { data } = await supabase
        .from('event_participants')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('event_id', currentEventId)
        .maybeSingle();
      return !!data;
    },
    enabled: !!currentUser?.id && !!currentEventId,
    ...slowNetworkQueryOptions,
  });

  const { data: questions = [], isLoading: questionsLoading, error: questionsError } = useQuery({
    queryKey: ['attendee-questions', currentUser?.id, currentEventId],
    queryFn: async (): Promise<QuestionWithProfile[]> => {
      if (!currentUser?.id || !currentEventId) return [];

      const { data: questionsData, error } = await supabase
        .from('questions')
        .select('id, content, created_at, upvotes, is_answered, user_id, session_id, event_id, is_anonymous')
        .eq('event_id', currentEventId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Batch fetch profiles for non-anonymous questions
      const userIds = [...new Set((questionsData || []).filter(q => !q.is_anonymous).map(q => q.user_id))];
      const profilesMap: Record<string, { name: string; photo_url: string | null }> = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, photo_url')
          .in('id', userIds);
        profiles?.forEach(p => { profilesMap[p.id] = { name: p.name || '', photo_url: p.photo_url }; });
      }

      const result = (questionsData || []).map(q => ({
        ...q,
        profiles: q.is_anonymous ? null : profilesMap[q.user_id] || null
      }));

      setCache(`${CACHE_KEY}-${currentUser.id}`, result);
      return result;
    },
    enabled: !!currentUser?.id && !!currentEventId,
    ...slowNetworkQueryOptions,
    placeholderData: () => currentUser?.id ? getCache<QuestionWithProfile[]>(`${CACHE_KEY}-${currentUser.id}`) ?? undefined : undefined,
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['attendee-sessions', currentUser?.id, currentEventId],
    queryFn: async (): Promise<Session[]> => {
      if (!currentUser?.id || !currentEventId) return [];
      const { data, error } = await supabase
        .from('speakers')
        .select('id, name, session_title, session_time')
        .eq('event_id', currentEventId)
        .not('session_time', 'is', null)
        .not('session_title', 'is', null)
        .order('session_time', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser?.id && !!currentEventId,
    ...slowNetworkQueryOptions,
  });

  const submitQuestionMutation = useMutation({
    mutationFn: async (questionData: { content: string; isAnonymous: boolean; selectedSessionId: string }) => {
      if (!currentUser?.id) throw new Error('User not authenticated');
      if (!currentEventId) throw new Error('No current event found');

      const { data: participant } = await supabase
        .from('event_participants')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('event_id', currentEventId)
        .maybeSingle();

      if (!participant) throw new Error('You must join the event to submit questions.');

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

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendee-questions'] });
      toast({ title: "Success", description: "Your question has been submitted!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error?.message || "Failed to submit question", variant: "destructive" });
    },
  });

  const upvoteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const { data: question, error: fetchError } = await supabase
        .from('questions')
        .select('upvotes')
        .eq('id', questionId)
        .single();
      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('questions')
        .update({ upvotes: question.upvotes + 1 })
        .eq('id', questionId);
      if (error) throw error;
      return questionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendee-questions'] });
      toast({ title: "Success", description: "Question upvoted!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to upvote question", variant: "destructive" });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      if (!currentUser?.id) throw new Error('User not authenticated');
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId)
        .eq('user_id', currentUser.id);
      if (error) throw error;
      return questionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendee-questions'] });
      toast({ title: "Success", description: "Question deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete question", variant: "destructive" });
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
    deleteQuestion: deleteQuestionMutation.mutate,
    isSubmitting: submitQuestionMutation.isPending,
    isDeleting: deleteQuestionMutation.isPending,
    isParticipant: isParticipantQuery.data,
    isParticipantLoading: isParticipantQuery.isLoading,
  };
};

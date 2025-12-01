
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAttendeeEventContext } from '@/contexts/AttendeeEventContext';
import { getCache, setCache, slowNetworkQueryOptions } from '@/utils/queryCache';

export interface Poll {
  id: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    votes?: number;
  }>;
  is_active: boolean;
  show_results: boolean;
  event_id?: string;
  created_at: string;
  vote_limit?: number | null;
  totalVotes?: number;
  require_submission?: boolean | null;
}

export interface PollVote {
  id: string;
  poll_id: string;
  user_id: string;
  option_id: string;
  created_at: string;
}

const CACHE_KEY = 'attendee-polls';

export const useAttendeePolls = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasJoinedEvent, currentEventId } = useAttendeeEventContext();

  const { data: polls = [], isLoading, error } = useQuery({
    queryKey: ['attendee-polls', currentUser?.id, currentEventId],
    queryFn: async (): Promise<Poll[]> => {
      if (!currentUser?.id || !hasJoinedEvent || !currentEventId) return [];

      // Fetch polls and votes in parallel
      const [pollsResponse, votesResponse] = await Promise.all([
        supabase
          .from('polls')
          .select('id, question, options, is_active, show_results, event_id, created_at, vote_limit, require_submission')
          .eq('event_id', currentEventId)
          .order('created_at', { ascending: false }),
        supabase
          .from('poll_votes')
          .select('poll_id, option_id')
      ]);

      if (pollsResponse.error) throw pollsResponse.error;

      // Build vote counts map
      const voteCounts: Record<string, Record<string, number>> = {};
      votesResponse.data?.forEach(vote => {
        if (!voteCounts[vote.poll_id]) voteCounts[vote.poll_id] = {};
        voteCounts[vote.poll_id][vote.option_id] = (voteCounts[vote.poll_id][vote.option_id] || 0) + 1;
      });

      const pollsWithVotes = (pollsResponse.data || []).map(poll => {
        const options = (poll.options as any[]) || [];
        const pollVotes = voteCounts[poll.id] || {};
        const optionsWithVotes = options.map(option => ({
          ...option,
          votes: pollVotes[option.id] || 0
        }));
        const totalVotes = optionsWithVotes.reduce((acc, opt) => acc + (opt.votes || 0), 0);
        return { ...poll, options: optionsWithVotes, totalVotes };
      });

      setCache(`${CACHE_KEY}-${currentUser.id}`, pollsWithVotes);
      return pollsWithVotes as Poll[];
    },
    enabled: !!currentUser?.id && hasJoinedEvent && !!currentEventId,
    ...slowNetworkQueryOptions,
    placeholderData: () => currentUser?.id ? getCache<Poll[]>(`${CACHE_KEY}-${currentUser.id}`) ?? undefined : undefined,
  });

  const { data: userVotes = [], isLoading: votesLoading } = useQuery({
    queryKey: ['attendee-poll-votes', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const { data, error } = await supabase
        .from('poll_votes')
        .select('id, poll_id, user_id, option_id, created_at')
        .eq('user_id', currentUser.id);
      if (error) throw error;
      return data as PollVote[];
    },
    enabled: !!currentUser?.id,
    ...slowNetworkQueryOptions,
  });

  const voteMutation = useMutation({
    mutationFn: async ({ pollId, optionId }: { pollId: string; optionId: string }) => {
      if (!currentUser?.id) throw new Error('User not authenticated');

      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', currentUser.id)
        .single();

      if (existingVote) throw new Error('You have already voted on this poll');

      const poll = polls.find(p => p.id === pollId);
      if (poll?.vote_limit && poll.totalVotes && poll.totalVotes >= poll.vote_limit) {
        throw new Error('This poll has reached its maximum number of votes');
      }

      const { data, error } = await supabase
        .from('poll_votes')
        .insert([{ poll_id: pollId, user_id: currentUser.id, option_id: optionId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendee-poll-votes'] });
      queryClient.invalidateQueries({ queryKey: ['attendee-polls'] });
      toast({ title: 'Vote Submitted', description: 'Thank you for your feedback!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message || 'Failed to submit vote.', variant: 'destructive' });
    },
  });

  return {
    polls,
    userVotes,
    isLoading: isLoading || votesLoading,
    error,
    submitVote: voteMutation.mutateAsync,
    isSubmitting: voteMutation.isPending,
  };
};

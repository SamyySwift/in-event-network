
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useGuestEventContext } from '@/contexts/GuestEventContext';

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

export const useAttendeePolls = (overrideEventId?: string) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { guestEventId } = useGuestEventContext();
  
  // Use override > guest event > need to fetch from user profile
  const directEventId = overrideEventId || (!currentUser ? guestEventId : null);

  const { data: polls = [], isLoading, error } = useQuery({
    queryKey: ['attendee-polls', currentUser?.id, directEventId],
    queryFn: async (): Promise<Poll[]> => {
      let targetEventId = directEventId;

      // If no direct event ID, get from user profile
      if (!targetEventId && currentUser?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('current_event_id')
          .eq('id', currentUser.id)
          .single();

        targetEventId = profile?.current_event_id || null;
      }

      if (!targetEventId) {
        return [];
      }

      const { data: polls, error } = await supabase
        .from('polls')
        .select('*')
        .eq('event_id', targetEventId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching attendee polls:', error);
        throw error;
      }

      // Fetch vote counts for each poll
      const pollsWithVotes = await Promise.all(
        (polls || []).map(async (poll) => {
          const { data: votes } = await supabase
            .from('poll_votes')
            .select('option_id')
            .eq('poll_id', poll.id);

          const voteCounts: Record<string, number> = {};
          votes?.forEach(vote => {
            voteCounts[vote.option_id] = (voteCounts[vote.option_id] || 0) + 1;
          });

          const options = (poll.options as any[]) || [];
          const optionsWithVotes = options.map((option) => ({
            ...option,
            votes: voteCounts[option.id] || 0
          }));

          const totalVotes = optionsWithVotes.reduce((acc, option) => acc + (option.votes || 0), 0);

          return {
            ...poll,
            options: optionsWithVotes,
            totalVotes
          };
        })
      );

      return pollsWithVotes as Poll[];
    },
    enabled: !!currentUser?.id || !!directEventId,
  });

  const { data: userVotes = [], isLoading: votesLoading } = useQuery({
    queryKey: ['attendee-poll-votes', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];

      const { data, error } = await supabase
        .from('poll_votes')
        .select('*')
        .eq('user_id', currentUser.id);

      if (error) throw error;
      return data as PollVote[];
    },
    enabled: !!currentUser?.id,
  });

  const voteMutation = useMutation({
    mutationFn: async ({ pollId, optionId }: { pollId: string; optionId: string }) => {
      if (!currentUser?.id) {
        throw new Error('Please sign in to vote');
      }

      // First check if user already voted
      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', currentUser.id)
        .single();

      if (existingVote) {
        throw new Error('You have already voted on this poll');
      }

      // Check if poll has vote limit and if it's reached
      const poll = polls.find(p => p.id === pollId);
      if (poll?.vote_limit && poll.totalVotes && poll.totalVotes >= poll.vote_limit) {
        throw new Error('This poll has reached its maximum number of votes');
      }

      const { data, error } = await supabase
        .from('poll_votes')
        .insert([{
          poll_id: pollId,
          user_id: currentUser.id,
          option_id: optionId
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendee-poll-votes'] });
      queryClient.invalidateQueries({ queryKey: ['attendee-polls'] });
      toast({
        title: 'Vote Submitted',
        description: 'Thank you for your feedback!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit vote. Please try again.',
        variant: 'destructive',
      });
      console.error('Error submitting vote:', error);
    },
  });

  // Check if user is a guest (not authenticated)
  const isGuest = !currentUser;

  return {
    polls,
    userVotes,
    isLoading: isLoading || votesLoading,
    error,
    submitVote: voteMutation.mutateAsync,
    isSubmitting: voteMutation.isPending,
    isGuest,
  };
};

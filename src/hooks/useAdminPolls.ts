
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
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
  created_by?: string;
  created_at: string;
  updated_at?: string;
  vote_limit?: number | null;
  require_submission?: boolean | null;
  start_time?: string;
  end_time?: string;
  allow_multiple?: boolean;
}

export interface PollVote {
  id: string;
  poll_id: string;
  user_id: string;
  option_id: string;
  created_at: string;
}

const CACHE_KEY = 'admin-polls';

export const useAdminPolls = (eventId?: string) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: polls = [], isLoading, error } = useQuery({
    queryKey: ['admin-polls', currentUser?.id, eventId],
    queryFn: async (): Promise<Poll[]> => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('polls')
        .select(`*, events!inner(host_id)`)
        .eq('events.host_id', currentUser.id);

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch vote counts for each poll
      const pollsWithVotes = await Promise.all(
        (data || []).map(async (poll) => {
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

          return { ...poll, options: optionsWithVotes };
        })
      );

      setCache(`${CACHE_KEY}-${currentUser.id}-${eventId || 'all'}`, pollsWithVotes);
      return pollsWithVotes as Poll[];
    },
    enabled: !!currentUser?.id,
    placeholderData: () => getCache<Poll[]>(`${CACHE_KEY}-${currentUser?.id}-${eventId || 'all'}`) || [],
    ...slowNetworkQueryOptions,
  });

  const createPollMutation = useMutation({
    mutationFn: async (pollData: Omit<Poll, 'id' | 'created_at' | 'updated_at'> & { event_id: string }) => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Creating poll:', pollData);

      // Verify the event belongs to the current admin
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('host_id')
        .eq('id', pollData.event_id)
        .eq('host_id', currentUser.id)
        .single();

      if (eventError || !event) {
        throw new Error('Event not found or access denied');
      }

      const now = new Date();
      const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

      const { data, error } = await supabase
        .from('polls')
        .insert({
          question: pollData.question,
          options: pollData.options,
          is_active: pollData.is_active,
          show_results: pollData.show_results,
          event_id: pollData.event_id,
          vote_limit: pollData.vote_limit ?? null,
          require_submission: !!pollData.require_submission,
          start_time: now.toISOString(),          // added
          end_time: endTime.toISOString(),        // added
          display_as_banner: false,               // match other hook’s default
          created_by: currentUser.id              // ensure RLS passes
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating poll:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-polls', currentUser?.id] });
      toast({
        title: 'Poll Created',
        description: 'The poll has been created successfully.',
      });
    },
    onError: (error) => {
      console.error('Error creating poll:', error);
      toast({
        title: 'Error',
        description: `Failed to create poll: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updatePollMutation = useMutation({
    mutationFn: async ({ id, ...pollData }: Partial<Poll> & { id: string }) => {
      const { data, error } = await supabase
        .from('polls')
        .update(pollData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating poll:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-polls', currentUser?.id] });
      toast({
        title: 'Poll Updated',
        description: 'The poll has been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Error updating poll:', error);
      toast({
        title: 'Error',
        description: `Failed to update poll: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deletePollMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('polls')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting poll:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-polls', currentUser?.id] });
      toast({
        title: 'Poll Deleted',
        description: 'The poll has been removed successfully.',
        variant: 'destructive',
      });
    },
    onError: (error) => {
      console.error('Error deleting poll:', error);
      toast({
        title: 'Error',
        description: `Failed to delete poll: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    polls,
    isLoading,
    error,
    createPoll: createPollMutation.mutate,
    updatePoll: updatePollMutation.mutate,
    deletePoll: deletePollMutation.mutate,
    isCreating: createPollMutation.isPending,
    isUpdating: updatePollMutation.isPending,
    isDeleting: deletePollMutation.isPending,
  };
};

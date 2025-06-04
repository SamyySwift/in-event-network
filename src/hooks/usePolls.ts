
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

export interface PollVote {
  id: string;
  poll_id: string;
  user_id: string;
  option_id: string;
  created_at: string;
}

export const usePolls = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: polls = [], isLoading, error } = useQuery({
    queryKey: ['polls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch vote counts for each poll
      const pollsWithVotes = await Promise.all(
        data.map(async (poll) => {
          const { data: votes } = await supabase
            .from('poll_votes')
            .select('option_id')
            .eq('poll_id', poll.id);

          const voteCounts: Record<string, number> = {};
          votes?.forEach(vote => {
            voteCounts[vote.option_id] = (voteCounts[vote.option_id] || 0) + 1;
          });

          // Type assertion for the options array
          const options = (poll.options as any[]) || [];
          const optionsWithVotes = options.map((option) => ({
            ...option,
            votes: voteCounts[option.id] || 0
          }));

          return {
            ...poll,
            options: optionsWithVotes
          };
        })
      );

      return pollsWithVotes as Poll[];
    },
  });

  const createPollMutation = useMutation({
    mutationFn: async (pollData: Omit<Poll, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('polls')
        .insert([{
          question: pollData.question,
          options: pollData.options,
          is_active: pollData.is_active,
          show_results: pollData.show_results,
          created_by: user.user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      toast({
        title: 'Poll Created',
        description: 'The poll has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create poll. Please try again.',
        variant: 'destructive',
      });
      console.error('Error creating poll:', error);
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

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      toast({
        title: 'Poll Updated',
        description: 'The poll has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update poll. Please try again.',
        variant: 'destructive',
      });
      console.error('Error updating poll:', error);
    },
  });

  const deletePollMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('polls')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      toast({
        title: 'Poll Deleted',
        description: 'The poll has been removed successfully.',
        variant: 'destructive',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete poll. Please try again.',
        variant: 'destructive',
      });
      console.error('Error deleting poll:', error);
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

export const usePollVotes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userVotes = [], isLoading } = useQuery({
    queryKey: ['poll-votes'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('poll_votes')
        .select('*')
        .eq('user_id', user.user.id);

      if (error) throw error;
      return data as PollVote[];
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ pollId, optionId }: { pollId: string; optionId: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // First check if user already voted
      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', user.user.id)
        .single();

      if (existingVote) {
        throw new Error('You have already voted on this poll');
      }

      const { data, error } = await supabase
        .from('poll_votes')
        .insert([{
          poll_id: pollId,
          user_id: user.user.id,
          option_id: optionId
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poll-votes'] });
      queryClient.invalidateQueries({ queryKey: ['polls'] });
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

  return {
    userVotes,
    isLoading,
    submitVote: voteMutation.mutate,
    isSubmitting: voteMutation.isPending,
  };
};

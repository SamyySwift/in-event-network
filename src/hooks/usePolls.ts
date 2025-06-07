
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface PollOption {
  id: string;
  text: string;
  votes?: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  start_time: string;
  end_time: string;
  is_active: boolean;
  show_results: boolean;
  display_as_banner: boolean;
  event_id?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

export const usePolls = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  const { data: polls = [], isLoading, error } = useQuery({
    queryKey: ['polls', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) {
        return [];
      }

      let query = supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false });

      if (currentUser.role === 'host') {
        // Hosts see only their own polls
        const { data: hostEvents } = await supabase
          .from('events')
          .select('id')
          .eq('host_id', currentUser.id);

        const eventIds = hostEvents?.map(e => e.id) || [];
        if (eventIds.length === 0) {
          return [];
        }
        query = query.in('event_id', eventIds);
      } else if (currentUser.role === 'attendee') {
        // Attendees see polls from events they've joined
        const { data: participantData } = await supabase
          .from('event_participants')
          .select('event_id')
          .eq('user_id', currentUser.id);

        const eventIds = participantData?.map(p => p.event_id) || [];
        if (eventIds.length === 0) {
          return [];
        }
        query = query.in('event_id', eventIds);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching polls:', error);
        throw error;
      }
      return data as Poll[];
    },
    enabled: !!currentUser,
  });

  const { data: activePoll } = useQuery({
    queryKey: ['activePoll', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;

      let eventIds: string[] = [];

      if (currentUser.role === 'host') {
        const { data: hostEvents } = await supabase
          .from('events')
          .select('id')
          .eq('host_id', currentUser.id);
        eventIds = hostEvents?.map(e => e.id) || [];
      } else if (currentUser.role === 'attendee') {
        const { data: participantData } = await supabase
          .from('event_participants')
          .select('event_id')
          .eq('user_id', currentUser.id);
        eventIds = participantData?.map(p => p.event_id) || [];
      }

      if (eventIds.length === 0) return null;

      const { data: poll, error } = await supabase
        .rpc('get_poll_with_results', { poll_uuid: null })
        .select('*')
        .in('event_id', eventIds)
        .eq('is_active', true)
        .eq('display_as_banner', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching active poll:', error);
        return null;
      }

      return poll as Poll | null;
    },
    enabled: !!currentUser,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const createPollMutation = useMutation({
    mutationFn: async (pollData: Omit<Poll, 'id' | 'created_at' | 'updated_at'>) => {
      if (!currentUser || currentUser.role !== 'host') {
        throw new Error('Only hosts can create polls');
      }

      const { data, error } = await supabase
        .from('polls')
        .insert([{
          ...pollData,
          created_by: currentUser.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Create poll error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['activePoll'] });
      toast({
        title: 'Poll Created',
        description: 'The poll has been created successfully.',
      });
    },
    onError: (error) => {
      console.error('Create poll error:', error);
      toast({
        title: 'Error',
        description: `Failed to create poll: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const votePollMutation = useMutation({
    mutationFn: async ({ pollId, optionId }: { pollId: string; optionId: string }) => {
      if (!currentUser) {
        throw new Error('You must be logged in to vote');
      }

      const { data, error } = await supabase
        .from('poll_votes')
        .insert([{
          poll_id: pollId,
          option_id: optionId,
          user_id: currentUser.id,
        }]);

      if (error) {
        console.error('Vote poll error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['activePoll'] });
      toast({
        title: 'Vote Submitted',
        description: 'Your vote has been recorded successfully.',
      });
    },
    onError: (error) => {
      console.error('Vote poll error:', error);
      toast({
        title: 'Error',
        description: `Failed to submit vote: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updatePollMutation = useMutation({
    mutationFn: async ({ id, ...pollData }: Partial<Poll> & { id: string }) => {
      if (!currentUser || currentUser.role !== 'host') {
        throw new Error('Only hosts can update polls');
      }

      const { data, error } = await supabase
        .from('polls')
        .update(pollData)
        .eq('id', id)
        .eq('created_by', currentUser.id) // Ensure only creator can update
        .select()
        .single();

      if (error) {
        console.error('Update poll error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['activePoll'] });
      toast({
        title: 'Poll Updated',
        description: 'The poll has been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Update poll error:', error);
      toast({
        title: 'Error',
        description: `Failed to update poll: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    polls,
    activePoll,
    isLoading,
    error,
    createPoll: createPollMutation.mutate,
    votePoll: votePollMutation.mutate,
    updatePoll: updatePollMutation.mutate,
    isCreating: createPollMutation.isPending,
    isVoting: votePollMutation.isPending,
    isUpdating: updatePollMutation.isPending,
  };
};

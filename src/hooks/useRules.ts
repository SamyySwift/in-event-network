import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Rule {
  id: string;
  title: string;
  content: string;
  category?: string;
  priority: 'low' | 'medium' | 'high';
  event_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useRules = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  const { data: rules = [], isLoading, error } = useQuery({
    queryKey: ['rules', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) {
        return [];
      }

      let query = supabase
        .from('rules')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (currentUser.role === 'host') {
        // Hosts see only their own rules
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
        query = query.in('event_id', eventIds);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching rules:', error);
        throw error;
      }
      return data as Rule[];
    },
    enabled: !!currentUser,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const createRuleMutation = useMutation({
    mutationFn: async (ruleData: Omit<Rule, 'id' | 'created_at' | 'updated_at'>) => {
      if (!currentUser || currentUser.role !== 'host') {
        throw new Error('Only hosts can create rules');
      }

      const { data, error } = await supabase
        .from('rules')
        .insert([{
          ...ruleData,
          created_by: currentUser.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Create rule error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      toast({
        title: 'Rule Created',
        description: 'The rule has been created successfully.',
      });
    },
    onError: (error) => {
      console.error('Create rule error:', error);
      toast({
        title: 'Error',
        description: `Failed to create rule: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: async ({ id, ...ruleData }: Partial<Rule> & { id: string }) => {
      if (!currentUser || currentUser.role !== 'host') {
        throw new Error('Only hosts can update rules');
      }

      const { data, error } = await supabase
        .from('rules')
        .update(ruleData)
        .eq('id', id)
        .eq('created_by', currentUser.id)
        .select()
        .single();

      if (error) {
        console.error('Update rule error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      toast({
        title: 'Rule Updated',
        description: 'The rule has been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Update rule error:', error);
      toast({
        title: 'Error',
        description: `Failed to update rule: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentUser || currentUser.role !== 'host') {
        throw new Error('Only hosts can delete rules');
      }

      const { error } = await supabase
        .from('rules')
        .delete()
        .eq('id', id)
        .eq('created_by', currentUser.id);

      if (error) {
        console.error('Delete rule error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      toast({
        title: 'Rule Deleted',
        description: 'The rule has been removed successfully.',
        variant: 'destructive',
      });
    },
    onError: (error) => {
      console.error('Delete rule error:', error);
      toast({
        title: 'Error',
        description: `Failed to delete rule: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    rules,
    isLoading,
    error,
    createRule: createRuleMutation.mutate,
    updateRule: updateRuleMutation.mutate,
    deleteRule: deleteRuleMutation.mutate,
    isCreating: createRuleMutation.isPending,
    isUpdating: updateRuleMutation.isPending,
    isDeleting: deleteRuleMutation.isPending,
  };
};


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Rule {
  id: string;
  title: string;
  content: string;
  category?: string;
  priority?: 'high' | 'medium' | 'low';
  created_by?: string;
  event_id?: string;
  created_at: string;
  updated_at?: string;
}

type RuleInput = {
  title: string;
  content: string;
  category?: string;
  priority?: 'high' | 'medium' | 'low';
};

export const useRules = (eventId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  const enabled = !!currentUser?.id && !!eventId;

  const { data: rules = [], isLoading, error } = useQuery({
    queryKey: ['rules', currentUser?.id, eventId],
    queryFn: async () => {
      if (!currentUser?.id) throw new Error('User not authenticated');
      if (!eventId) return [];
      try {
        console.log('Fetching rules for admin:', currentUser.id, 'event:', eventId);
        const { data, error } = await supabase
          .from('rules')
          .select('*')
          .eq('created_by', currentUser.id)
          .eq('event_id', eventId)
          .order('created_at', { ascending: false });
        if (error) {
          console.error('Error fetching rules:', error);
          throw error;
        }
        console.log('Rules fetched successfully:', data?.length || 0);
        return (data || []) as Rule[];
      } catch (err) {
        console.error('Unexpected error fetching rules:', err);
        throw err;
      }
    },
    enabled,
  });

  const createRuleMutation = useMutation({
    mutationFn: async (ruleData: RuleInput) => {
      if (!currentUser?.id) throw new Error('User not authenticated');
      if (!eventId) throw new Error('No event selected');
      const { data, error } = await supabase
        .from('rules')
        .insert({
          title: ruleData.title,
          content: ruleData.content,
          category: ruleData.category,
          priority: ruleData.priority || 'medium',
          created_by: currentUser.id,
          event_id: eventId,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules', currentUser?.id, eventId] });
      toast({
        title: 'Rule Created',
        description: 'The rule has been created successfully for this event.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create rule. Please try again.',
        variant: 'destructive',
      });
      console.error('Error creating rule:', error);
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: async ({ id, ...ruleData }: Partial<Rule> & { id: string }) => {
      if (!currentUser?.id) throw new Error('User not authenticated');
      if (!eventId) throw new Error('No event selected');
      const { data, error } = await supabase
        .from('rules')
        .update({ ...ruleData })
        .eq('id', id)
        .eq('created_by', currentUser.id)
        .eq('event_id', eventId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules', currentUser?.id, eventId] });
      toast({
        title: 'Rule Updated',
        description: 'The rule has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update rule. Please try again.',
        variant: 'destructive',
      });
      console.error('Error updating rule:', error);
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentUser?.id) throw new Error('User not authenticated');
      if (!eventId) throw new Error('No event selected');
      const { error } = await supabase
        .from('rules')
        .delete()
        .eq('id', id)
        .eq('created_by', currentUser.id)
        .eq('event_id', eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules', currentUser?.id, eventId] });
      toast({
        title: 'Rule Deleted',
        description: 'The rule has been removed successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete rule. Please try again.',
        variant: 'destructive',
      });
      console.error('Error deleting rule:', error);
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

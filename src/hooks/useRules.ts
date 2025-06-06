
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Rule {
  id: string;
  title: string;
  content: string;
  category?: string;
  priority?: 'high' | 'medium' | 'low';
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

export const useRules = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rules = [], isLoading, error } = useQuery({
    queryKey: ['rules'],
    queryFn: async () => {
      // Use direct SQL query to access the rules table
      const { data, error } = await supabase.rpc('get_rules');
      
      if (error) {
        // Fallback: try direct table access (might work if types are updated)
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('rules' as any)
          .select('*')
          .order('created_at', { ascending: false });
        
        if (fallbackError) {
          console.error('Error fetching rules:', fallbackError);
          return [];
        }
        return fallbackData as Rule[];
      }
      return data as Rule[];
    },
  });

  const createRuleMutation = useMutation({
    mutationFn: async (ruleData: { title: string; content: string; category?: string; priority?: 'high' | 'medium' | 'low' }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('rules' as any)
        .insert({
          title: ruleData.title,
          content: ruleData.content,
          category: ruleData.category,
          priority: ruleData.priority,
          created_by: user.user.id
        })
        .select()
        .single();

      if (error) throw error;
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
      toast({
        title: 'Error',
        description: 'Failed to create rule. Please try again.',
        variant: 'destructive',
      });
      console.error('Error creating rule:', error);
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: async ({ id, ...ruleData }: Partial<Rule> & { id: string }) => {
      const { data, error } = await supabase
        .from('rules' as any)
        .update(ruleData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
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
      toast({
        title: 'Error',
        description: 'Failed to update rule. Please try again.',
        variant: 'destructive',
      });
      console.error('Error updating rule:', error);
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rules' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
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
      toast({
        title: 'Error',
        description: 'Failed to delete rule. Please try again.',
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

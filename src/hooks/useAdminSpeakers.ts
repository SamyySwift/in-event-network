
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Speaker {
  id: string;
  name: string;
  title?: string;
  company?: string;
  bio: string;
  photo_url?: string;
  session_title?: string;
  session_time?: string;
  twitter_link?: string;
  linkedin_link?: string;
  website_link?: string;
  event_id?: string;
  created_at: string;
  updated_at: string;
}

export const useAdminSpeakers = (eventId?: string) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: speakers = [], isLoading, error } = useQuery({
    queryKey: ['admin-speakers', currentUser?.id, eventId],
    queryFn: async (): Promise<Speaker[]> => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching speakers for admin:', currentUser.id, 'event:', eventId);

      let query = supabase
        .from('speakers')
        .select(`
          *,
          events!inner(host_id)
        `)
        .eq('events.host_id', currentUser.id);

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin speakers:', error);
        throw error;
      }

      console.log('Admin speakers fetched:', data?.length || 0);
      return data as Speaker[];
    },
    enabled: !!currentUser?.id,
  });

  const createSpeakerMutation = useMutation({
    mutationFn: async (speakerData: Omit<Speaker, 'id' | 'created_at' | 'updated_at'>) => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Creating speaker:', speakerData);

      const { data, error } = await supabase
        .from('speakers')
        .insert([{
          ...speakerData,
          created_by: currentUser.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating speaker:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-speakers'] });
      toast({
        title: 'Speaker Created',
        description: 'The speaker has been added successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create speaker: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    speakers,
    isLoading,
    error,
    createSpeaker: createSpeakerMutation.mutate,
    isCreating: createSpeakerMutation.isPending,
  };
};


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getCache, setCache, slowNetworkQueryOptions } from '@/utils/queryCache';

export interface Speaker {
  id: string;
  name: string;
  bio: string;
  company?: string;
  topic?: string;
  photo_url?: string;
  session_title?: string;
  session_time?: string;
  start_date?: string;
  start_time?: string;
  end_date?: string;
  end_time?: string;
  time_allocation?: string;
  title?: string;
  linkedin_link?: string;
  twitter_link?: string;
  website_link?: string;
  instagram_link?: string;
  tiktok_link?: string;
  event_id?: string;
  created_at: string;
  updated_at: string;
}

const CACHE_KEY = 'admin-speakers';

export const useAdminSpeakers = (eventId?: string) => {
  const queryClient = useQueryClient();

  const {
    data: speakers = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-speakers', eventId],
    queryFn: async (): Promise<Speaker[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id')
        .eq('host_id', user.id);

      if (eventsError) throw eventsError;

      if (!events || events.length === 0) {
        return [];
      }

      const eventIds = events.map(event => event.id);

      let query = supabase
        .from('speakers')
        .select('*')
        .in('event_id', eventIds)
        .order('created_at', { ascending: false });

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data: speakers, error: speakersError } = await query;

      if (speakersError) throw speakersError;

      const result = speakers || [];
      setCache(`${CACHE_KEY}-${eventId || 'all'}`, result);
      return result;
    },
    placeholderData: () => getCache<Speaker[]>(`${CACHE_KEY}-${eventId || 'all'}`) || [],
    ...slowNetworkQueryOptions,
  });

  const createSpeakerMutation = useMutation({
    mutationFn: async (speakerData: Omit<Speaker, 'id' | 'created_at' | 'updated_at'> & { event_id: string }) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      if (!speakerData.event_id) {
        throw new Error('Event must be selected to create a speaker');
      }

      console.log('Creating speaker:', speakerData);

      // Verify the event belongs to the current admin
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('host_id')
        .eq('id', speakerData.event_id)
        .eq('host_id', user.id)
        .single();

      if (eventError || !event) {
        throw new Error('Event not found or access denied');
      }

      const { data, error } = await supabase
        .from('speakers')
        .insert([{
          ...speakerData,
          created_by: user.id
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
      toast.success('Speaker created successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to create speaker: ${error.message}`);
    },
  });

  const updateSpeakerMutation = useMutation({
    mutationFn: async ({ id, ...speakerData }: Partial<Speaker> & { id: string }) => {
      console.log('Updating speaker:', id, speakerData);
      
      const { data, error } = await supabase
        .from('speakers')
        .update(speakerData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating speaker:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-speakers'] });
      toast.success('Speaker updated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to update speaker: ${error.message}`);
    },
  });

  const deleteSpeakerMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting speaker:', id);
      const { error } = await supabase
        .from('speakers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting speaker:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-speakers'] });
      toast.success('Speaker deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to delete speaker: ${error.message}`);
    },
  });

  return {
    speakers,
    isLoading,
    error,
    refetch,
    createSpeaker: createSpeakerMutation.mutate,
    updateSpeaker: updateSpeakerMutation.mutate,
    deleteSpeaker: deleteSpeakerMutation.mutate,
    isCreating: createSpeakerMutation.isPending,
    isUpdating: updateSpeakerMutation.isPending,
    isDeleting: deleteSpeakerMutation.isPending,
  };
};


import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAttendeeSpeakers = () => {
  const { currentUser } = useAuth();

  const { data: speakers = [], isLoading, error } = useQuery({
    queryKey: ['attendee-speakers', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      // Get the user's current event from their profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('current_event_id')
        .eq('id', currentUser.id)
        .single();

      if (!userProfile?.current_event_id) {
        return [];
      }

      // Get the current event to find the host
      const { data: currentEvent } = await supabase
        .from('events')
        .select('host_id')
        .eq('id', userProfile.current_event_id)
        .single();

      if (!currentEvent?.host_id) {
        return [];
      }

      // Get all events from the same host
      const { data: hostEvents } = await supabase
        .from('events')
        .select('id')
        .eq('host_id', currentEvent.host_id);

      const eventIds = hostEvents?.map(e => e.id) || [];

      if (eventIds.length === 0) {
        return [];
      }

      // Get speakers for events from this host only
      const { data: speakers, error } = await supabase
        .from('speakers')
        .select('*')
        .in('event_id', eventIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching attendee speakers:', error);
        throw error;
      }

      return speakers || [];
    },
    enabled: !!currentUser?.id,
  });

  return {
    speakers,
    isLoading,
    error,
  };
};

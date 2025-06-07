
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAttendeeEvents = () => {
  const { currentUser } = useAuth();

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['attendee-events', currentUser?.id],
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
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .eq('host_id', currentEvent.host_id)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching attendee events:', error);
        throw error;
      }

      return events || [];
    },
    enabled: !!currentUser?.id,
  });

  return {
    events,
    isLoading,
    error,
  };
};


import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AttendeeContext {
  currentEventId: string | null;
  hostId: string | null;
  hostEvents: string[];
}

export const useAttendeeContext = () => {
  const { currentUser } = useAuth();

  const { data: context, isLoading, error } = useQuery({
    queryKey: ['attendee-context', currentUser?.id],
    queryFn: async (): Promise<AttendeeContext> => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching attendee context for user:', currentUser.id);

      // Get the user's current event from their profile
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('current_event_id')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw profileError;
      }

      if (!userProfile?.current_event_id) {
        console.log('No current event ID found for user');
        return {
          currentEventId: null,
          hostId: null,
          hostEvents: [],
        };
      }

      console.log('User current event ID:', userProfile.current_event_id);

      // Get the current event to find the host
      const { data: currentEvent, error: eventError } = await supabase
        .from('events')
        .select('host_id')
        .eq('id', userProfile.current_event_id)
        .single();

      if (eventError) {
        console.error('Error fetching current event:', eventError);
        return {
          currentEventId: userProfile.current_event_id,
          hostId: null,
          hostEvents: [],
        };
      }

      if (!currentEvent?.host_id) {
        console.log('No host ID found for current event');
        return {
          currentEventId: userProfile.current_event_id,
          hostId: null,
          hostEvents: [],
        };
      }

      console.log('Event host ID:', currentEvent.host_id);

      // Get all events from the same host
      const { data: hostEvents, error: hostEventsError } = await supabase
        .from('events')
        .select('id')
        .eq('host_id', currentEvent.host_id);

      if (hostEventsError) {
        console.error('Error fetching host events:', hostEventsError);
      }

      const result = {
        currentEventId: userProfile.current_event_id,
        hostId: currentEvent.host_id,
        hostEvents: hostEvents?.map(e => e.id) || [],
      };

      console.log('Attendee context result:', result);
      return result;
    },
    enabled: !!currentUser?.id,
    refetchInterval: 60000, // Refetch every minute
    retry: 3,
    retryDelay: 1000,
  });

  return {
    context,
    isLoading,
    error,
  };
};

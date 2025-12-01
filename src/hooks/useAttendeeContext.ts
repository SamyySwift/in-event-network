
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestEventContext } from '@/contexts/GuestEventContext';

interface AttendeeContext {
  currentEventId: string | null;
  hostId: string | null;
  hostEvents: string[];
}

export const useAttendeeContext = (overrideEventId?: string) => {
  const { currentUser } = useAuth();
  const { guestEventId } = useGuestEventContext();
  
  // Use override > guest event > authenticated user's event
  const directEventId = overrideEventId || (!currentUser ? guestEventId : null);

  const { data: context, isLoading, error } = useQuery({
    queryKey: ['attendee-context', currentUser?.id, directEventId],
    queryFn: async (): Promise<AttendeeContext> => {
      let targetEventId = directEventId;

      // If no direct event ID, get from user profile
      if (!targetEventId && currentUser?.id) {
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('current_event_id')
          .eq('id', currentUser.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          throw profileError;
        }

        targetEventId = userProfile?.current_event_id || null;
      }

      if (!targetEventId) {
        return {
          currentEventId: null,
          hostId: null,
          hostEvents: [],
        };
      }

      // Get the current event to find the host
      const { data: currentEvent, error: eventError } = await supabase
        .from('events')
        .select('host_id')
        .eq('id', targetEventId)
        .single();

      if (eventError) {
        console.error('Error fetching current event:', eventError);
        return {
          currentEventId: targetEventId,
          hostId: null,
          hostEvents: [],
        };
      }

      if (!currentEvent?.host_id) {
        return {
          currentEventId: targetEventId,
          hostId: null,
          hostEvents: [],
        };
      }

      // Get all events from the same host
      const { data: hostEvents, error: hostEventsError } = await supabase
        .from('events')
        .select('id')
        .eq('host_id', currentEvent.host_id);

      if (hostEventsError) {
        console.error('Error fetching host events:', hostEventsError);
      }

      return {
        currentEventId: targetEventId,
        hostId: currentEvent.host_id,
        hostEvents: hostEvents?.map(e => e.id) || [],
      };
    },
    enabled: !!currentUser?.id || !!directEventId,
    refetchInterval: 60000,
    retry: 3,
    retryDelay: 1000,
  });

  return {
    context,
    isLoading,
    error,
  };
};

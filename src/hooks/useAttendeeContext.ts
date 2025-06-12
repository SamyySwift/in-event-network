
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

      // Get the user's current event from their profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('current_event_id')
        .eq('id', currentUser.id)
        .single();

      if (!userProfile?.current_event_id) {
        return {
          currentEventId: null,
          hostId: null,
          hostEvents: [],
        };
      }

      // Get the current event to find the host
      const { data: currentEvent } = await supabase
        .from('events')
        .select('host_id')
        .eq('id', userProfile.current_event_id)
        .single();

      if (!currentEvent?.host_id) {
        return {
          currentEventId: userProfile.current_event_id,
          hostId: null,
          hostEvents: [],
        };
      }

      // Get all events from the same host
      const { data: hostEvents } = await supabase
        .from('events')
        .select('id')
        .eq('host_id', currentEvent.host_id);

      return {
        currentEventId: userProfile.current_event_id,
        hostId: currentEvent.host_id,
        hostEvents: hostEvents?.map(e => e.id) || [],
      };
    },
    enabled: !!currentUser?.id,
    refetchInterval: 60000, // Refetch every minute
  });

  return {
    context,
    isLoading,
    error,
  };
};

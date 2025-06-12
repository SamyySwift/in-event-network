
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

      console.log('Starting attendee context fetch for user:', currentUser.id);

      // Get the most recent event this user has joined from event_participants
      // This is now the single source of truth for current event
      const { data: userEvents, error: userEventsError } = await supabase
        .from('event_participants')
        .select('event_id, joined_at')
        .eq('user_id', currentUser.id)
        .order('joined_at', { ascending: false })
        .limit(1);

      if (userEventsError) {
        console.error('Error fetching user events:', userEventsError);
        return {
          currentEventId: null,
          hostId: null,
          hostEvents: [],
        };
      }

      console.log('User events from event_participants:', userEvents);

      if (!userEvents || userEvents.length === 0) {
        console.log('User has not joined any events');
        return {
          currentEventId: null,
          hostId: null,
          hostEvents: [],
        };
      }

      const currentEventId = userEvents[0].event_id;
      console.log('Current event ID from event_participants:', currentEventId);

      // Get the current event to find the host
      const { data: currentEvent } = await supabase
        .from('events')
        .select('host_id')
        .eq('id', currentEventId)
        .single();

      if (!currentEvent?.host_id) {
        return {
          currentEventId: currentEventId,
          hostId: null,
          hostEvents: [],
        };
      }

      // Get all events from the same host
      const { data: hostEvents } = await supabase
        .from('events')
        .select('id')
        .eq('host_id', currentEvent.host_id);

      console.log('Final context:', {
        currentEventId,
        hostId: currentEvent.host_id,
        hostEvents: hostEvents?.map(e => e.id) || []
      });

      return {
        currentEventId: currentEventId,
        hostId: currentEvent.host_id,
        hostEvents: hostEvents?.map(e => e.id) || [],
      };
    },
    enabled: !!currentUser?.id,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  return {
    context,
    isLoading,
    error,
  };
};

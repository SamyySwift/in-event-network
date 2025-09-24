
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

      // Try to get current_event_id from profile first
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('current_event_id')
        .eq('id', currentUser.id)
        .single();

      // Helper to resolve the rest of the context (host_id + hostEvents) given an eventId
      const buildContextFromEvent = async (eventId: string | null): Promise<AttendeeContext> => {
        if (!eventId) {
          return { currentEventId: null, hostId: null, hostEvents: [] };
        }

        const { data: currentEvent, error: eventError } = await supabase
          .from('events')
          .select('host_id')
          .eq('id', eventId)
          .single();

        if (eventError || !currentEvent?.host_id) {
          console.error('Error fetching current event:', eventError);
          return { currentEventId: eventId, hostId: null, hostEvents: [] };
        }

        console.log('Event host ID:', currentEvent.host_id);

        const { data: hostEvents, error: hostEventsError } = await supabase
          .from('events')
          .select('id')
          .eq('host_id', currentEvent.host_id);

        if (hostEventsError) {
          console.error('Error fetching host events:', hostEventsError);
        }

        const result = {
          currentEventId: eventId,
          hostId: currentEvent.host_id,
          hostEvents: hostEvents?.map(e => e.id) || [],
        };

        console.log('Attendee context result:', result);
        return result;
      };

      // If profile query failed, try fallback via event_participants
      if (profileError) {
        console.error('Error fetching user profile:', profileError);

        const { data: ep, error: epError } = await supabase
          .from('event_participants')
          .select('event_id')
          .eq('user_id', currentUser.id)
          .order('joined_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (epError) {
          console.error('Fallback via event_participants failed:', epError);
          throw profileError; // bubble the original profile error
        }

        return buildContextFromEvent(ep?.event_id ?? null);
      }

      // If no current event in profile, use the same fallback
      if (!userProfile?.current_event_id) {
        console.log('No current event ID found for user; checking event_participants fallback');
        const { data: ep, error: epError } = await supabase
          .from('event_participants')
          .select('event_id')
          .eq('user_id', currentUser.id)
          .order('joined_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (epError) {
          console.error('Fallback via event_participants failed:', epError);
          return { currentEventId: null, hostId: null, hostEvents: [] };
        }

        return buildContextFromEvent(ep?.event_id ?? null);
      }

      console.log('User current event ID:', userProfile.current_event_id);
      return buildContextFromEvent(userProfile.current_event_id);
    },
    enabled: !!currentUser?.id,
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

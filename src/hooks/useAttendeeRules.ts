
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestEventContext } from '@/contexts/GuestEventContext';

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

export const useAttendeeRules = (overrideEventId?: string) => {
  const { currentUser } = useAuth();
  const { guestEventId } = useGuestEventContext();
  
  // Use override > guest event > authenticated user's event
  const directEventId = overrideEventId || (!currentUser ? guestEventId : null);

  const { data: rules = [], isLoading, error } = useQuery({
    queryKey: ['attendee-rules', currentUser?.id, directEventId],
    queryFn: async () => {
      let targetEventId = directEventId;

      // If no direct event ID, get from user profile
      if (!targetEventId && currentUser?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('current_event_id')
          .eq('id', currentUser.id)
          .single();

        targetEventId = profile?.current_event_id || null;
      }

      if (!targetEventId) {
        return [];
      }

      // Get the event's host
      const { data: event } = await supabase
        .from('events')
        .select('host_id')
        .eq('id', targetEventId)
        .single();

      if (!event?.host_id) {
        return [];
      }

      // Get all events from the same host
      const { data: hostEvents } = await supabase
        .from('events')
        .select('id')
        .eq('host_id', event.host_id);

      const eventIds = hostEvents?.map(e => e.id) || [];

      if (eventIds.length === 0) {
        return [];
      }

      // Fetch rules for all host events
      const { data, error } = await supabase
        .from('rules')
        .select('*')
        .in('event_id', eventIds)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching attendee rules:', error);
        throw error;
      }
      
      return (data || []) as Rule[];
    },
    enabled: !!currentUser?.id || !!directEventId,
  });

  return {
    rules,
    isLoading,
    error,
  };
};

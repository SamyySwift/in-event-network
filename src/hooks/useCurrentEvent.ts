
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Event {
  id: string;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  banner_url?: string;
  logo_url?: string;
  website?: string;
  event_key?: string;
  host_id?: string;
  created_at: string;
  updated_at: string;
}

export const useCurrentEvent = () => {
  const { currentUser } = useAuth();

  const { data: currentEvent, isLoading, error } = useQuery({
    queryKey: ['currentEvent', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) {
        return null;
      }

      // For hosts, get their first event
      if (currentUser.role === 'host') {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('host_id', currentUser.id)
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error('Error fetching host event:', error);
          throw error;
        }

        return data as Event | null;
      }

      // For attendees, get their current event from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('current_event_id')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      if (!profile?.current_event_id) {
        return null;
      }

      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', profile.current_event_id)
        .single();

      if (eventError) {
        console.error('Error fetching current event:', eventError);
        throw eventError;
      }

      return event as Event;
    },
    enabled: !!currentUser,
  });

  return {
    currentEvent,
    isLoading,
    error,
  };
};

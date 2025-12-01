
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendeeEventContext } from '@/contexts/AttendeeEventContext';

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

export const useAttendeeRules = () => {
  const { currentUser } = useAuth();
  const { hostEvents, hasJoinedEvent } = useAttendeeEventContext();

  const { data: rules = [], isLoading, error } = useQuery({
    queryKey: ['attendee-rules', currentUser?.id, hostEvents],
    queryFn: async () => {
      if (!currentUser?.id || !hasJoinedEvent || hostEvents.length === 0) {
        return [];
      }

      try {
        console.log('Fetching rules for attendee events:', hostEvents);
        
        // Only fetch rules for events from the same host
        const { data, error } = await supabase
          .from('rules')
          .select('*')
          .in('event_id', hostEvents)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching attendee rules:', error);
          throw error;
        }
        
        console.log('Attendee rules fetched successfully:', data?.length || 0);
        return (data || []) as Rule[];
      } catch (err) {
        console.error('Unexpected error fetching attendee rules:', err);
        throw err;
      }
    },
    enabled: !!currentUser?.id && hasJoinedEvent && hostEvents.length > 0,
  });

  return {
    rules,
    isLoading,
    error,
  };
};

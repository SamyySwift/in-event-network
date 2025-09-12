
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
  const { currentEventId, hasJoinedEvent } = useAttendeeEventContext();

  const { data: rules = [], isLoading, error } = useQuery({
    queryKey: ['attendee-rules', currentUser?.id, currentEventId],
    queryFn: async () => {
      if (!currentUser?.id || !hasJoinedEvent || !currentEventId) {
        return [];
      }

      try {
        console.log('Fetching rules for attendee current event:', currentEventId);
        const { data, error } = await supabase
          .from('rules')
          .select('*')
          .eq('event_id', currentEventId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching attendee rules:', error);
          throw error;
        }
        return (data || []) as Rule[];
      } catch (err) {
        console.error('Unexpected error fetching attendee rules:', err);
        throw err;
      }
    },
    enabled: !!currentUser?.id && hasJoinedEvent && !!currentEventId,
  });

  return { rules, isLoading, error };
};

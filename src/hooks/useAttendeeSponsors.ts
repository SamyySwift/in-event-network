import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAttendeeContext } from './useAttendeeContext';

export const useAttendeeSponsors = () => {
  const { context } = useAttendeeContext();

  // Fetch approved sponsors for the current event
  const { data: sponsors = [], isLoading } = useQuery({
    queryKey: ['attendee-sponsors', context?.currentEventId],
    queryFn: async () => {
      if (!context?.currentEventId) return [];
      
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .eq('event_id', context.currentEventId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!context?.currentEventId,
  });

  return {
    sponsors,
    isLoading,
  };
};
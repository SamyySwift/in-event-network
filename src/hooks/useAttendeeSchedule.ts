
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAttendeeSchedule = () => {
  const { currentUser } = useAuth();

  const { data: scheduleItems = [], isLoading, error } = useQuery({
    queryKey: ['attendee-schedule', currentUser?.id],
    queryFn: async () => {
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
        return [];
      }

      // Get schedule items for the current event
      const { data: scheduleItems, error } = await supabase
        .from('schedule_items')
        .select('*')
        .eq('event_id', userProfile.current_event_id)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching attendee schedule:', error);
        throw error;
      }

      return scheduleItems || [];
    },
    enabled: !!currentUser?.id,
  });

  return {
    scheduleItems,
    isLoading,
    error,
  };
};

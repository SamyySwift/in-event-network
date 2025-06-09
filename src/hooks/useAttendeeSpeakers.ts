
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAttendeeSpeakers = () => {
  const { currentUser } = useAuth();

  const { data: speakers = [], isLoading, error } = useQuery({
    queryKey: ['attendee-speakers', currentUser?.id],
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

      // Get speakers for the current event only
      const { data: speakers, error } = await supabase
        .from('speakers')
        .select('*')
        .eq('event_id', userProfile.current_event_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching attendee speakers:', error);
        throw error;
      }

      return speakers || [];
    },
    enabled: !!currentUser?.id,
  });

  return {
    speakers,
    isLoading,
    error,
  };
};

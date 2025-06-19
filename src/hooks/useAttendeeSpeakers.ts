
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

      console.log('Fetching speakers for user:', currentUser.id);

      // Get the user's current event from their profile
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('current_event_id')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw profileError;
      }

      if (!userProfile?.current_event_id) {
        console.log('No current event ID found for user');
        return [];
      }

      console.log('Fetching speakers for event:', userProfile.current_event_id);

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

      console.log('Speakers fetched successfully:', speakers?.length || 0);
      return speakers || [];
    },
    enabled: !!currentUser?.id,
    retry: 3,
    retryDelay: 1000,
  });

  return {
    speakers,
    isLoading,
    error,
  };
};

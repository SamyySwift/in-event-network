
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Add Speaker interface with topic and time_allocation fields
interface Speaker {
  id: string;
  name: string;
  title?: string;
  company?: string;
  bio: string;
  photo_url?: string;
  session_title?: string;
  session_time?: string;
  time_allocation?: string; // Add time_allocation field
  twitter_link?: string;
  linkedin_link?: string;
  website_link?: string;
  topic?: string; // Add topic field
  event_id?: string;
  created_at: string;
  updated_at: string;
}

export const useAttendeeSpeakers = () => {
  const { currentUser } = useAuth();

  const { data: speakers = [], isLoading, error } = useQuery({
    queryKey: ['attendee-speakers', currentUser?.id],
    queryFn: async (): Promise<Speaker[]> => {
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
      return speakers as Speaker[] || [];
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


import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestEventContext } from '@/contexts/GuestEventContext';

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
  time_allocation?: string;
  twitter_link?: string;
  linkedin_link?: string;
  website_link?: string;
  instagram_link?: string;
  tiktok_link?: string;
  topic?: string;
  event_id?: string;
  created_at: string;
  updated_at: string;
}

export const useAttendeeSpeakers = (overrideEventId?: string) => {
  const { currentUser } = useAuth();
  const { guestEventId } = useGuestEventContext();
  
  // Use override > guest event > authenticated user's event
  const directEventId = overrideEventId || (!currentUser ? guestEventId : null);

  const { data: speakers = [], isLoading, error } = useQuery({
    queryKey: ['attendee-speakers', currentUser?.id, directEventId],
    queryFn: async (): Promise<Speaker[]> => {
      let targetEventId = directEventId;

      // If no direct event ID, get from user profile
      if (!targetEventId && currentUser?.id) {
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('current_event_id')
          .eq('id', currentUser.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          throw profileError;
        }

        targetEventId = userProfile?.current_event_id || null;
      }

      if (!targetEventId) {
        return [];
      }

      // Get speakers for the event
      const { data: speakers, error } = await supabase
        .from('speakers')
        .select('*')
        .eq('event_id', targetEventId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching attendee speakers:', error);
        throw error;
      }

      return speakers as Speaker[] || [];
    },
    enabled: !!currentUser?.id || !!directEventId,
    retry: 3,
    retryDelay: 1000,
  });

  return {
    speakers,
    isLoading,
    error,
  };
};


import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AttendeeProfile {
  id: string;
  name: string;
  role: string;
  company?: string;
  bio?: string;
  niche?: string;
  photo_url?: string;
  networking_preferences?: string[];
  tags?: string[];
  twitter_link?: string;
  linkedin_link?: string;
  github_link?: string;
  instagram_link?: string;
  website_link?: string;
  created_at: string;
}

export const useAttendeeNetworking = () => {
  const { currentUser } = useAuth();

  const { data: attendees = [], isLoading, error } = useQuery({
    queryKey: ['attendee-networking', currentUser?.id],
    queryFn: async (): Promise<AttendeeProfile[]> => {
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

      // Get the current event to find the host
      const { data: currentEvent } = await supabase
        .from('events')
        .select('host_id')
        .eq('id', userProfile.current_event_id)
        .single();

      if (!currentEvent?.host_id) {
        return [];
      }

      // Get all events from the same host
      const { data: hostEvents } = await supabase
        .from('events')
        .select('id')
        .eq('host_id', currentEvent.host_id);

      const eventIds = hostEvents?.map(e => e.id) || [];

      if (eventIds.length === 0) {
        return [];
      }

      // Get attendees from events by the same host (excluding current user)
      const { data: eventParticipants, error } = await supabase
        .from('event_participants')
        .select(`
          user_id,
          profiles:user_id (
            id,
            name,
            role,
            company,
            bio,
            niche,
            photo_url,
            networking_preferences,
            tags,
            twitter_link,
            linkedin_link,
            github_link,
            instagram_link,
            website_link,
            created_at
          )
        `)
        .in('event_id', eventIds)
        .neq('user_id', currentUser.id);

      if (error) {
        console.error('Error fetching attendee networking data:', error);
        throw error;
      }

      // Transform and filter the data
      const attendees = eventParticipants?.map((participant: any) => participant.profiles).filter(Boolean) || [];

      return attendees as AttendeeProfile[];
    },
    enabled: !!currentUser?.id,
  });

  return {
    attendees,
    isLoading,
    error,
  };
};

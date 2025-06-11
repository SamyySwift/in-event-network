
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
        console.log('No current user found');
        return [];
      }

      console.log('Starting attendee networking fetch for user:', currentUser.id);

      // First, get the most recent event this user has joined from event_participants
      const { data: userEvents, error: userEventsError } = await supabase
        .from('event_participants')
        .select('event_id, joined_at')
        .eq('user_id', currentUser.id)
        .order('joined_at', { ascending: false })
        .limit(1);

      if (userEventsError) {
        console.error('Error fetching user events:', userEventsError);
        return [];
      }

      console.log('User events data:', userEvents);

      if (!userEvents || userEvents.length === 0) {
        console.log('User has not joined any events');
        return [];
      }

      const currentEventId = userEvents[0].event_id;
      console.log('Current event ID:', currentEventId, 'User ID:', currentUser.id);

      // Get all attendees from the current event (excluding current user)
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
        .eq('event_id', currentEventId)
        .neq('user_id', currentUser.id);

      if (error) {
        console.error('Error fetching event participants:', error);
        throw error;
      }

      console.log('Raw event participants data:', eventParticipants);
      console.log('Number of participants (excluding current user):', eventParticipants?.length || 0);

      // Transform and filter the data
      const attendees = eventParticipants
        ?.map((participant: any) => {
          console.log('Processing participant:', participant);
          return participant.profiles;
        })
        .filter((profile) => {
          const isValid = profile && profile.id;
          if (!isValid) {
            console.log('Filtered out invalid profile:', profile);
          }
          return isValid;
        }) || [];

      console.log('Final attendees list:', attendees);
      console.log('Number of valid attendees:', attendees.length);
      
      return attendees as AttendeeProfile[];
    },
    enabled: !!currentUser?.id,
    refetchInterval: 5000, // Refetch every 5 seconds to get latest data
    staleTime: 0, // Always consider data stale to force refetch
  });

  console.log('Hook returning:', { attendees, isLoading, error });

  return {
    attendees,
    isLoading,
    error,
  };
};

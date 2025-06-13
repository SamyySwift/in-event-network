
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendeeEventContext } from '@/contexts/AttendeeEventContext';

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
  const { currentEventId } = useAttendeeEventContext();

  const { data: attendees = [], isLoading, error } = useQuery({
    queryKey: ['attendee-networking', currentUser?.id, currentEventId],
    queryFn: async (): Promise<AttendeeProfile[]> => {
      if (!currentUser?.id || !currentEventId) {
        console.log('No current user or event found');
        console.log('Current user ID:', currentUser?.id);
        console.log('Current event ID:', currentEventId);
        return [];
      }

      console.log('Starting attendee networking fetch for user:', currentUser.id, 'in event:', currentEventId);

      try {
        // First, get all event participants for this event excluding current user
        const { data: eventParticipants, error: participantsError } = await supabase
          .from('event_participants')
          .select('user_id')
          .eq('event_id', currentEventId)
          .neq('user_id', currentUser.id);

        if (participantsError) {
          console.error('Error fetching event participants:', participantsError);
          throw participantsError;
        }

        console.log('Event participants (excluding current user):', eventParticipants);

        if (!eventParticipants || eventParticipants.length === 0) {
          console.log('No other participants found');
          return [];
        }

        // Get the user IDs
        const userIds = eventParticipants.map(p => p.user_id);
        console.log('User IDs to fetch profiles for:', userIds);

        // Now fetch the profiles for these users
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          throw profilesError;
        }

        console.log('Raw profiles data:', profiles);
        console.log('Number of profiles found:', profiles?.length || 0);

        // Transform the profiles
        const attendees = profiles
          ?.map((profile) => ({
            id: profile.id,
            name: profile.name || 'Unknown',
            role: profile.role || 'No role specified',
            company: profile.company,
            bio: profile.bio,
            niche: profile.niche,
            photo_url: profile.photo_url,
            networking_preferences: profile.networking_preferences,
            tags: profile.tags,
            twitter_link: profile.twitter_link,
            linkedin_link: profile.linkedin_link,
            github_link: profile.github_link,
            instagram_link: profile.instagram_link,
            website_link: profile.website_link,
            created_at: profile.created_at,
          })) || [];

        console.log('Final attendees list (excluding current user):', attendees);
        console.log('Number of valid attendees:', attendees.length);
        
        return attendees as AttendeeProfile[];
      } catch (error) {
        console.error('Error in attendee networking query:', error);
        throw error;
      }
    },
    enabled: !!currentUser?.id && !!currentEventId,
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
  });

  return {
    attendees,
    isLoading,
    error,
  };
};

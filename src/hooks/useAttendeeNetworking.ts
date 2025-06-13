
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

      // Filter and transform the profiles
      const attendees = profiles
        ?.filter((profile) => {
          const isValid = profile && profile.id && profile.id !== currentUser.id;
          if (!isValid) {
            console.log('Filtered out invalid or current user profile:', profile);
          }
          return isValid;
        })
        .map((profile) => ({
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
    },
    enabled: !!currentUser?.id && !!currentEventId,
    refetchInterval: 5000, // Refetch every 5 seconds to get latest data
    staleTime: 0, // Always consider data stale to force refetch
  });

  return {
    attendees,
    isLoading,
    error,
  };
};

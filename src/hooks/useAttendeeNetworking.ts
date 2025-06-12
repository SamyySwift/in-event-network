
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

      // Get the current user's profile to find their current event
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
        console.log('User has no current event');
        return [];
      }

      const currentEventId = userProfile.current_event_id;
      console.log('Current event ID:', currentEventId);

      // Get all participants from the current event (excluding current user)
      const { data: eventParticipants, error: participantsError } = await supabase
        .from('event_participants')
        .select(`
          user_id,
          profiles!event_participants_user_id_fkey (
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

      if (participantsError) {
        console.error('Error fetching event participants:', participantsError);
        throw participantsError;
      }

      console.log('Raw event participants data:', eventParticipants);
      console.log('Number of participants (excluding current user):', eventParticipants?.length || 0);

      // Transform the data to match our interface
      const attendees = eventParticipants
        ?.map((participant: any) => {
          const profile = participant.profiles;
          if (!profile || !profile.id) {
            console.log('Filtered out participant with invalid profile:', participant);
            return null;
          }
          return {
            id: profile.id,
            name: profile.name || 'Unknown',
            role: profile.role || '',
            company: profile.company || '',
            bio: profile.bio || '',
            niche: profile.niche || '',
            photo_url: profile.photo_url || '',
            networking_preferences: profile.networking_preferences || [],
            tags: profile.tags || [],
            twitter_link: profile.twitter_link || '',
            linkedin_link: profile.linkedin_link || '',
            github_link: profile.github_link || '',
            instagram_link: profile.instagram_link || '',
            website_link: profile.website_link || '',
            created_at: profile.created_at || '',
          } as AttendeeProfile;
        })
        .filter((attendee): attendee is AttendeeProfile => attendee !== null) || [];

      console.log('Final attendees list:', attendees);
      console.log('Number of valid attendees:', attendees.length);
      
      return attendees;
    },
    enabled: !!currentUser?.id,
    refetchInterval: 30000, // Refetch every 30 seconds to get latest data
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  console.log('Hook returning:', { attendees, isLoading, error });

  return {
    attendees,
    isLoading,
    error,
  };
};

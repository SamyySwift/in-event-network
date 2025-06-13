
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
        // Get all attendees from the current event with proper foreign key syntax
        const { data: eventParticipants, error: queryError } = await supabase
          .from('event_participants')
          .select(`
            *,
            profiles!user_id (*)
          `)
          .eq('event_id', currentEventId);

        if (queryError) {
          console.error('Error fetching event participants:', queryError);
          throw queryError;
        }

        console.log('Raw event participants data:', eventParticipants);
        console.log('Number of participants found:', eventParticipants?.length || 0);

        if (!eventParticipants || eventParticipants.length === 0) {
          console.log('No participants found for event:', currentEventId);
          return [];
        }

        // Transform and filter the data, excluding the current user
        const attendees = eventParticipants
          ?.map((participant: any) => {
            console.log('Processing participant:', participant);
            console.log('Participant profile data:', participant.profiles);
            return participant.profiles;
          })
          .filter((profile) => {
            const isValid = profile && profile.id;
            const isNotCurrentUser = profile?.id !== currentUser.id;
            
            if (!isValid) {
              console.log('Filtered out invalid profile:', profile);
              return false;
            }
            
            if (!isNotCurrentUser) {
              console.log('Filtered out current user from attendees list');
              return false;
            }
            
            return true;
          }) || [];

        console.log('Final attendees list (excluding current user):', attendees);
        console.log('Number of valid attendees (excluding current user):', attendees.length);
        
        return attendees as AttendeeProfile[];
      } catch (err) {
        console.error('Error in attendee networking query:', err);
        throw err;
      }
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


import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAttendeeEventContext } from "@/contexts/AttendeeEventContext";

interface AttendeeProfile {
  id: string;
  name?: string;
  role?: string;
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
  networking_visible?: boolean; // Add this line
  created_at?: string;
}

export const useAttendeeNetworking = () => {
  const { currentUser } = useAuth();
  const { currentEventId } = useAttendeeEventContext();

  console.log('useAttendeeNetworking - currentUser:', currentUser?.id);
  console.log('useAttendeeNetworking - currentEventId:', currentEventId);

  const {
    data: attendees = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["attendee-networking", currentUser?.id, currentEventId],
    enabled: !!currentUser?.id && !!currentEventId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async (): Promise<AttendeeProfile[]> => {
      if (!currentUser?.id || !currentEventId) {
        console.log('useAttendeeNetworking - Missing required data:', { 
          userId: currentUser?.id, 
          eventId: currentEventId 
        });
        return [];
      }

      console.log('useAttendeeNetworking - Fetching attendees for event:', currentEventId);

      try {
        // Use the RPC function to get attendees with profile data
        const { data, error } = await supabase.rpc('get_event_attendees_with_profiles', {
          p_event_id: currentEventId
        });

        if (error) {
          console.error('useAttendeeNetworking - RPC error:', error);
          throw error;
        }

        console.log('useAttendeeNetworking - Raw RPC data:', data);

        const attendeeProfiles = (data || [])
          .filter((row: any) => row.user_id !== currentUser.id) // Exclude current user
          .map((row: any) => ({
            id: row.user_id,
            name: row.name || "Unknown",
            role: row.role,
            company: row.company,
            bio: row.bio,
            niche: row.niche,
            photo_url: row.photo_url,
            networking_preferences: row.networking_preferences,
            tags: row.tags,
            twitter_link: row.twitter_link,
            linkedin_link: row.linkedin_link,
            github_link: row.github_link,
            instagram_link: row.instagram_link,
            website_link: row.website_link,
            created_at: row.created_at,
          })) as AttendeeProfile[];

        console.log('useAttendeeNetworking - Processed attendees:', attendeeProfiles);
        return attendeeProfiles;
      } catch (error) {
        console.error('useAttendeeNetworking - Query error:', error);
        throw error;
      }
    },
  });

  console.log('useAttendeeNetworking - Final state:', { 
    attendeesCount: attendees.length, 
    isLoading, 
    error: error?.message 
  });

  return { attendees, isLoading, error };
};

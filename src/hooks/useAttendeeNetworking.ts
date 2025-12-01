
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAttendeeEventContext } from "@/contexts/AttendeeEventContext";
import { getCache, setCache, slowNetworkQueryOptions } from '@/utils/queryCache';

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
  networking_visible?: boolean;
  created_at?: string;
}

const CACHE_KEY = 'attendee-networking';

export const useAttendeeNetworking = () => {
  const { currentUser } = useAuth();
  const { currentEventId } = useAttendeeEventContext();

  const { data: attendees = [], isLoading, error } = useQuery({
    queryKey: ["attendee-networking", currentUser?.id, currentEventId],
    enabled: !!currentUser?.id && !!currentEventId,
    ...slowNetworkQueryOptions,
    placeholderData: () => currentUser?.id ? getCache<AttendeeProfile[]>(`${CACHE_KEY}-${currentUser.id}`) ?? undefined : undefined,
    queryFn: async (): Promise<AttendeeProfile[]> => {
      if (!currentUser?.id || !currentEventId) return [];

      try {
        const { data, error } = await supabase.rpc('get_event_attendees_with_profiles', {
          p_event_id: currentEventId
        });

        if (error) throw error;

        const attendeeProfiles = (data || [])
          .filter((row: any) => row.user_id !== currentUser.id)
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

        setCache(`${CACHE_KEY}-${currentUser.id}`, attendeeProfiles);
        return attendeeProfiles;
      } catch (error) {
        console.error('useAttendeeNetworking - Query error:', error);
        throw error;
      }
    },
  });

  return { attendees, isLoading, error };
};

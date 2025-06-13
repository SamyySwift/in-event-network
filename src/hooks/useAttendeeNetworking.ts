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
  created_at?: string;
}

export const useAttendeeNetworking = () => {
  const { currentUser } = useAuth();
  const { currentEventId } = useAttendeeEventContext();

  const {
    data: attendees = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["attendee-networking", currentUser?.id, currentEventId],
    enabled: !!currentUser?.id && !!currentEventId,
    refetchInterval: 5_000,
    staleTime: 0,
    queryFn: async (): Promise<AttendeeProfile[]> => {
      if (!currentUser?.id || !currentEventId) return [];

      const { data, error } = await supabase
        .from("event_participants")
        .select(
          `
        user_id,
        joined_at,
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
      `
        )
        .eq("event_id", currentEventId);

      if (error) throw error;

      const everyone = (data ?? []).map((row: any) => {
        const p = row.profiles;
        return {
          id: p?.id ?? row.user_id,
          name: p?.name ?? "Unknown",
          role: p?.role,
          company: p?.company,
          bio: p?.bio,
          niche: p?.niche,
          photo_url: p?.photo_url,
          networking_preferences: p?.networking_preferences,
          tags: p?.tags,
          twitter_link: p?.twitter_link,
          linkedin_link: p?.linkedin_link,
          github_link: p?.github_link,
          instagram_link: p?.instagram_link,
          website_link: p?.website_link,
          created_at: p?.created_at ?? row.joined_at,
        } as AttendeeProfile;
      });

      return everyone.filter((a) => a.id !== currentUser.id);
    },
  });

  return { attendees, isLoading, error };
};

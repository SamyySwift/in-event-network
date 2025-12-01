
// Top-level imports
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestEventContext } from '@/contexts/GuestEventContext';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'high' | 'normal' | 'low';
  send_immediately: boolean;
  image_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  event_id?: string;
  twitter_link?: string;
  instagram_link?: string;
  facebook_link?: string;
  tiktok_link?: string;
  website_link?: string;
  whatsapp_link?: string;
  vendor_form_id?: string | null;
  require_submission?: boolean | null;
}

export const useAttendeeAnnouncements = (overrideEventId?: string) => {
  const { currentUser } = useAuth();
  const { guestEventId } = useGuestEventContext();
  
  // Use override > guest event > authenticated user's event
  const directEventId = overrideEventId || (!currentUser ? guestEventId : null);

  const { data: announcements = [], isLoading, error } = useQuery({
    queryKey: ['attendee-announcements', currentUser?.id, directEventId],
    queryFn: async () => {
      let targetEventId = directEventId;

      // If no direct event ID, get from user profile
      if (!targetEventId && currentUser?.id) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('current_event_id')
          .eq('id', currentUser.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          return [];
        }

        targetEventId = profile?.current_event_id || null;
      }

      if (!targetEventId) {
        return [];
      }

      // Fetch announcements for the event
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('event_id', targetEventId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching attendee announcements:', error);
        throw error;
      }

      return data as Announcement[];
    },
    enabled: !!currentUser?.id || !!directEventId,
    refetchInterval: 30000,
  });

  return {
    announcements,
    isLoading,
    error,
  };
};

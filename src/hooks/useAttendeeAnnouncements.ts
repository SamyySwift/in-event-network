
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  // New fields
  whatsapp_link?: string;
  vendor_form_id?: string | null;
  require_submission?: boolean | null;
}

export const useAttendeeAnnouncements = () => {
  const { currentUser } = useAuth();
  const { useAttendeeEventContext } = require('@/contexts/AttendeeEventContext');
  const { currentEventId } = useAttendeeEventContext();

  const { data: announcements = [], isLoading, error } = useQuery({
    queryKey: ['attendee-announcements', currentUser?.id, currentEventId],
    queryFn: async () => {
      if (!currentUser?.id || !currentEventId) {
        return [];
      }

      console.log('Fetching announcements for event:', currentEventId);

      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('event_id', currentEventId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching attendee announcements:', error);
        throw error;
      }

      console.log('Attendee announcements fetched:', data?.length || 0, data);
      return data as Announcement[];
    },
    enabled: !!currentUser?.id && !!currentEventId,
    refetchInterval: 30000,
  });

  return { announcements, isLoading, error };
};

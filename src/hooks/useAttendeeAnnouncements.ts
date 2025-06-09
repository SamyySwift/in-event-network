
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendeeEventContext } from '@/contexts/AttendeeEventContext';

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
}

export const useAttendeeAnnouncements = () => {
  const { currentUser } = useAuth();
  const { hostEvents, hasJoinedEvent } = useAttendeeEventContext();

  const { data: announcements = [], isLoading, error } = useQuery({
    queryKey: ['attendee-announcements', currentUser?.id, hostEvents],
    queryFn: async () => {
      if (!currentUser?.id || !hasJoinedEvent || hostEvents.length === 0) {
        return [];
      }

      console.log('Fetching announcements for attendee events:', hostEvents);

      // Only fetch announcements for events from the same host
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .in('event_id', hostEvents)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching attendee announcements:', error);
        throw error;
      }

      console.log('Attendee announcements fetched:', data?.length || 0);
      return data as Announcement[];
    },
    enabled: !!currentUser?.id && hasJoinedEvent && hostEvents.length > 0,
  });

  return {
    announcements,
    isLoading,
    error,
  };
};

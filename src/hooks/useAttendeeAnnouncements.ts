
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
}

export const useAttendeeAnnouncements = () => {
  const { currentUser } = useAuth();

  const { data: announcements = [], isLoading, error } = useQuery({
    queryKey: ['attendee-announcements', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) {
        console.log('No current user found');
        return [];
      }

      // Get the user's current event ID from their profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('current_event_id')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return [];
      }

      if (!profile?.current_event_id) {
        console.log('No current event found for user');
        return [];
      }

      console.log('Fetching announcements for event:', profile.current_event_id);

      // Fetch announcements for the user's current event
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('event_id', profile.current_event_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching attendee announcements:', error);
        throw error;
      }

      console.log('Attendee announcements fetched:', data?.length || 0, data);
      return data as Announcement[];
    },
    enabled: !!currentUser?.id,
    refetchInterval: 30000, // Refetch every 30 seconds for near real-time updates
  });

  return {
    announcements,
    isLoading,
    error,
  };
};

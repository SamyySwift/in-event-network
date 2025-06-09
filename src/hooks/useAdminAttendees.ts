
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';

interface AdminAttendee {
  id: string;
  name: string;
  email: string;
  role: string;
  photo_url?: string;
  bio?: string;
  company?: string;
  event_name: string;
  joined_at: string;
}

export const useAdminAttendees = () => {
  const { currentUser } = useAuth();
  const { selectedEventId, selectedEvent } = useAdminEventContext();

  const { data: attendees = [], isLoading, error } = useQuery({
    queryKey: ['admin-attendees', currentUser?.id, selectedEventId],
    queryFn: async (): Promise<AdminAttendee[]> => {
      if (!currentUser?.id || !selectedEventId) {
        console.log('Missing user or selected event:', { userId: currentUser?.id, eventId: selectedEventId });
        return [];
      }

      console.log('Fetching attendees for selected event:', selectedEventId);

      // Get attendees only for the selected event
      const { data, error } = await supabase
        .from('event_participants')
        .select(`
          joined_at,
          profiles:user_id (
            id,
            name,
            email,
            role,
            photo_url,
            bio,
            company
          )
        `)
        .eq('event_id', selectedEventId);

      if (error) {
        console.error('Error fetching admin attendees:', error);
        throw error;
      }

      console.log('Raw event participants data:', data);

      // Transform the data
      const transformedData = data?.map((item: any) => ({
        id: item.profiles?.id || '',
        name: item.profiles?.name || 'Unknown',
        email: item.profiles?.email || '',
        role: item.profiles?.role || '',
        photo_url: item.profiles?.photo_url,
        bio: item.profiles?.bio,
        company: item.profiles?.company,
        event_name: selectedEvent?.name || '',
        joined_at: item.joined_at
      })).filter(item => item.id) || [];

      console.log('Admin attendees fetched for event:', transformedData.length);
      return transformedData as AdminAttendee[];
    },
    enabled: !!currentUser?.id && !!selectedEventId,
  });

  return {
    attendees,
    isLoading,
    error,
  };
};

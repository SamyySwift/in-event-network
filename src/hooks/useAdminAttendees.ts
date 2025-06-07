
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

  const { data: attendees = [], isLoading, error } = useQuery({
    queryKey: ['admin-attendees', currentUser?.id],
    queryFn: async (): Promise<AdminAttendee[]> => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching attendees for admin:', currentUser.id);

      // Get attendees through event participants joined with profiles and events
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
          ),
          events:event_id (
            name,
            host_id
          )
        `)
        .eq('events.host_id', currentUser.id);

      if (error) {
        console.error('Error fetching admin attendees:', error);
        throw error;
      }

      // Transform the data to match AdminAttendee interface
      const transformedData = data?.map((item: any) => ({
        id: item.profiles?.id || '',
        name: item.profiles?.name || 'Unknown',
        email: item.profiles?.email || '',
        role: item.profiles?.role || '',
        photo_url: item.profiles?.photo_url,
        bio: item.profiles?.bio,
        company: item.profiles?.company,
        event_name: item.events?.name || '',
        joined_at: item.joined_at
      })).filter(item => item.id) || [];

      console.log('Admin attendees fetched:', transformedData.length);
      return transformedData as AdminAttendee[];
    },
    enabled: !!currentUser?.id,
  });

  return {
    attendees,
    isLoading,
    error,
  };
};


import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const { data: attendees = [], isLoading, error } = useQuery({
    queryKey: ['admin-attendees', currentUser?.id],
    queryFn: async (): Promise<AdminAttendee[]> => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching attendees for admin:', currentUser.id);

      // Use the security definer function to get attendees
      const { data, error } = await supabase.rpc('get_admin_attendees');

      if (error) {
        console.error('Error fetching admin attendees:', error);
        throw error;
      }

      console.log('Admin attendees fetched:', data?.length || 0);
      return data as AdminAttendee[];
    },
    enabled: !!currentUser?.id,
  });

  return {
    attendees,
    isLoading,
    error,
  };
};

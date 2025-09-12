
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Facility {
  id: string;
  name: string;
  description?: string;
  location?: string;
  rules?: string;
  contact_type?: 'none' | 'phone' | 'whatsapp';
  contact_info?: string;
  image_url?: string;
  icon_type?: string;
  event_id?: string;
  created_at: string;
}

export const useAttendeeFacilities = () => {
  const { currentUser } = useAuth();
  const { useAttendeeEventContext } = require('@/contexts/AttendeeEventContext');
  const { currentEventId } = useAttendeeEventContext();

  const { data: facilities = [], isLoading, error } = useQuery({
    queryKey: ['attendee-facilities', currentUser?.id, currentEventId],
    queryFn: async (): Promise<Facility[]> => {
      if (!currentUser?.id || !currentEventId) {
        return [];
      }

      const { data: facilities, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('event_id', currentEventId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching attendee facilities:', error);
        throw error;
      }

      return (facilities || []).map(facility => ({
        ...facility,
        contact_type: (facility.contact_type as 'none' | 'phone' | 'whatsapp') || 'none'
      }));
    },
    enabled: !!currentUser?.id && !!currentEventId,
  });

  return { facilities, isLoading, error };
};

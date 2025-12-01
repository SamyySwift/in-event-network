
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestEventContext } from '@/contexts/GuestEventContext';

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
  category?: 'facility' | 'exhibitor';
}

export const useAttendeeFacilities = (overrideEventId?: string) => {
  const { currentUser } = useAuth();
  const { guestEventId } = useGuestEventContext();
  
  // Use override > guest event > authenticated user's event
  const directEventId = overrideEventId || (!currentUser ? guestEventId : null);

  const { data: facilities = [], isLoading, error } = useQuery({
    queryKey: ['attendee-facilities', currentUser?.id, directEventId],
    queryFn: async (): Promise<Facility[]> => {
      let targetEventId = directEventId;

      // If no direct event ID, get from user profile
      if (!targetEventId && currentUser?.id) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('current_event_id')
          .eq('id', currentUser.id)
          .single();

        targetEventId = userProfile?.current_event_id || null;
      }

      if (!targetEventId) {
        return [];
      }

      // Get the current event to find the host
      const { data: currentEvent } = await supabase
        .from('events')
        .select('host_id')
        .eq('id', targetEventId)
        .single();

      if (!currentEvent?.host_id) {
        return [];
      }

      // Get all events from the same host
      const { data: hostEvents } = await supabase
        .from('events')
        .select('id')
        .eq('host_id', currentEvent.host_id);

      const eventIds = hostEvents?.map(e => e.id) || [];

      if (eventIds.length === 0) {
        return [];
      }

      // Get facilities for events from this host only
      const { data: facilities, error } = await supabase
        .from('facilities')
        .select('*')
        .in('event_id', eventIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching attendee facilities:', error);
        throw error;
      }

      // Type cast and validate the contact_type field
      const processedFacilities = (facilities || []).map(facility => ({
        ...facility,
        contact_type: (facility.contact_type as 'none' | 'phone' | 'whatsapp') || 'none'
      }));
      
      return processedFacilities;
    },
    enabled: !!currentUser?.id || !!directEventId,
  });

  return {
    facilities,
    isLoading,
    error,
  };
};

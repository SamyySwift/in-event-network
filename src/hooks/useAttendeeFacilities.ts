
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
  category?: 'facility' | 'exhibitor';
}

export const useAttendeeFacilities = () => {
  const { currentUser } = useAuth();

  const { data: facilities = [], isLoading, error } = useQuery({
    queryKey: ['attendee-facilities', currentUser?.id],
    queryFn: async (): Promise<Facility[]> => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      // Get the user's current event from their profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('current_event_id')
        .eq('id', currentUser.id)
        .single();

      if (!userProfile?.current_event_id) {
        return [];
      }

      // Get the current event to find the host
      const { data: currentEvent } = await supabase
        .from('events')
        .select('host_id')
        .eq('id', userProfile.current_event_id)
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
      
      console.log('Fetched facilities with images:', processedFacilities.filter(f => f.image_url));
      return processedFacilities;
    },
    enabled: !!currentUser?.id,
  });

  return {
    facilities,
    isLoading,
    error,
  };
};

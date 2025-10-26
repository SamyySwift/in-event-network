import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EventData {
  id: string;
  name: string;
  banner_url: string | null;
  logo_url: string | null;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  host_name: string | null;
}

export const useEventById = (eventId: string | null) => {
  return useQuery({
    queryKey: ['event-by-id', eventId],
    queryFn: async (): Promise<EventData | null> => {
      if (!eventId) {
        console.log('No event id provided to useEventById');
        return null;
      }

      console.log('Fetching event data by id:', eventId);

      // Fetch event by ID
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('id, name, banner_url, logo_url, description, start_time, end_time, location, host_id')
        .eq('id', eventId)
        .maybeSingle();

      if (eventError || !eventData) {
        console.error('Event not found for id:', eventId, eventError);
        return null;
      }

      // Fetch host profile name
      let hostName: string | null = null;
      if (eventData.host_id) {
        const { data: hostProfile, error: hostError } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', eventData.host_id)
          .maybeSingle();

        if (hostError) {
          console.warn('Could not fetch host name for event:', eventId, hostError);
        } else {
          hostName = hostProfile?.name ?? null;
        }
      }

      return {
        id: eventData.id,
        name: eventData.name,
        banner_url: eventData.banner_url,
        logo_url: eventData.logo_url,
        description: eventData.description,
        start_time: eventData.start_time,
        end_time: eventData.end_time,
        location: eventData.location,
        host_name: hostName,
      };
    },
    enabled: !!eventId,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
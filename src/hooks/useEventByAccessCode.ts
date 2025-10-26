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

export const useEventByAccessCode = (accessCode: string | null) => {
  return useQuery({
    queryKey: ['event-by-access-code', accessCode],
    queryFn: async (): Promise<EventData | null> => {
      if (!accessCode) {
        console.log('No access code provided to useEventByAccessCode');
        return null;
      }

      const trimmed = accessCode.trim();
      console.log('Fetching event data for access code:', trimmed);

      // If it's a 6-digit code, treat it as an event_key and fetch the event directly
      const isEventKey = /^\d{6}$/.test(trimmed);
      if (isEventKey) {
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('id, name, banner_url, logo_url, description, start_time, end_time, location, host_id')
          .eq('event_key', trimmed)
          .maybeSingle();

        if (eventError || !eventData) {
          console.error('Event not found for event key:', trimmed, eventError);
          return null;
        }

        let hostName: string | null = null;
        if (eventData.host_id) {
          const { data: hostProfile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', eventData.host_id)
            .maybeSingle();
          hostName = hostProfile?.name ?? null;
        }

        console.log('Found event by event_key:', eventData);
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
      }

      // Otherwise, treat it as a host access_key and fetch the latest event for that host
      const { data: hostProfile, error: hostError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('access_key', trimmed)
        .eq('role', 'host')
        .maybeSingle();

      if (hostError || !hostProfile) {
        console.error('Host not found for access code:', trimmed, hostError);
        return null;
      }

      console.log('Found host profile:', hostProfile);

      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('id, name, banner_url, logo_url, description, start_time, end_time, location')
        .eq('host_id', hostProfile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (eventError || !eventData) {
        console.error('Event not found for host:', hostProfile.id, eventError);
        return null;
      }

      console.log('Found event data:', eventData);

      return {
        ...eventData,
        host_name: hostProfile.name,
      };
    },
    enabled: !!accessCode,
    staleTime: Infinity, // Never mark as stale during registration flow
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 1, // Only retry once to avoid unnecessary requests
    refetchOnWindowFocus: false, // Prevent refetching when window gains focus
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

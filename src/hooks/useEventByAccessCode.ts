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

      // If it's a 6-digit code, try event_key first, then fall back to host access_key
      const isSixDigitCode = /^\d{6}$/.test(trimmed);
      if (isSixDigitCode) {
        // First, try to find event by event_key
        const { data: eventByKey, error: eventKeyError } = await supabase
          .from('events')
          .select('id, name, banner_url, logo_url, description, start_time, end_time, location, host_id')
          .eq('event_key', trimmed)
          .maybeSingle();

        if (eventByKey) {
          console.log('Found event by event_key:', eventByKey);
          console.log('Event banner_url:', eventByKey.banner_url);
          let hostName: string | null = null;
          if (eventByKey.host_id) {
            const { data: hostProfile, error: hostError } = await supabase
              .from('public_profiles')
              .select('name')
              .eq('id', eventByKey.host_id)
              .maybeSingle();
            console.log('Host profile query result:', { hostProfile, hostError });
            hostName = hostProfile?.name ?? null;
          }

          const result = {
            id: eventByKey.id,
            name: eventByKey.name,
            banner_url: eventByKey.banner_url,
            logo_url: eventByKey.logo_url,
            description: eventByKey.description,
            start_time: eventByKey.start_time,
            end_time: eventByKey.end_time,
            location: eventByKey.location,
            host_name: hostName,
          };
          console.log('Returning event data:', result);
          return result;
        }

        console.log('No event found by event_key for 6-digit code:', trimmed);
        return null;
      }

      // Non-6-digit codes are not supported for unauthenticated users
      console.log('Non-6-digit access codes not supported for unauthenticated lookup:', trimmed);
      return null;
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

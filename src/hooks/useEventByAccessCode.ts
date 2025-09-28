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
      if (!accessCode) return null;

      console.log('Fetching event data for access code:', accessCode);

      // First, find the host with this access key
      const { data: hostProfile, error: hostError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('access_key', accessCode)
        .eq('role', 'host')
        .single();

      if (hostError || !hostProfile) {
        console.error('Host not found for access code:', accessCode, hostError);
        return null;
      }

      console.log('Found host profile:', hostProfile);

      // Then get the most recent event for this host
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('id, name, banner_url, logo_url, description, start_time, end_time, location')
        .eq('host_id', hostProfile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

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
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getCache, setCache, slowNetworkQueryOptions } from '@/utils/queryCache';

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

const CACHE_KEY = 'attendee-facilities';

export const useAttendeeFacilities = () => {
  const { currentUser } = useAuth();

  const { data: facilities = [], isLoading, error } = useQuery({
    queryKey: ['attendee-facilities', currentUser?.id],
    queryFn: async (): Promise<Facility[]> => {
      if (!currentUser?.id) throw new Error('User not authenticated');

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('current_event_id')
        .eq('id', currentUser.id)
        .single();

      if (!userProfile?.current_event_id) return [];

      // Get facilities for user's current event only (optimized - single query)
      const { data: facilities, error } = await supabase
        .from('facilities')
        .select('id, name, description, location, rules, contact_type, contact_info, image_url, icon_type, event_id, created_at, category')
        .eq('event_id', userProfile.current_event_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const result = (facilities || []).map(f => ({
        ...f,
        contact_type: (f.contact_type as 'none' | 'phone' | 'whatsapp') || 'none'
      }));

      setCache(`${CACHE_KEY}-${currentUser.id}`, result);
      return result;
    },
    enabled: !!currentUser?.id,
    ...slowNetworkQueryOptions,
    placeholderData: () => currentUser?.id ? getCache<Facility[]>(`${CACHE_KEY}-${currentUser.id}`) ?? undefined : undefined,
  });

  return { facilities, isLoading, error };
};

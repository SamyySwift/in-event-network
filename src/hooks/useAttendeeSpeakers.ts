
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getCache, setCache, slowNetworkQueryOptions } from '@/utils/queryCache';

interface Speaker {
  id: string;
  name: string;
  title?: string;
  company?: string;
  bio: string;
  photo_url?: string;
  session_title?: string;
  session_time?: string;
  time_allocation?: string;
  twitter_link?: string;
  linkedin_link?: string;
  website_link?: string;
  instagram_link?: string;
  tiktok_link?: string;
  topic?: string;
  event_id?: string;
  created_at: string;
  updated_at: string;
}

const CACHE_KEY = 'attendee-speakers';

export const useAttendeeSpeakers = () => {
  const { currentUser } = useAuth();

  const { data: speakers = [], isLoading, error } = useQuery({
    queryKey: ['attendee-speakers', currentUser?.id],
    queryFn: async (): Promise<Speaker[]> => {
      if (!currentUser?.id) throw new Error('User not authenticated');

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('current_event_id')
        .eq('id', currentUser.id)
        .single();

      if (!userProfile?.current_event_id) return [];

      const { data: speakers, error } = await supabase
        .from('speakers')
        .select('*')
        .eq('event_id', userProfile.current_event_id)
        .order('session_time', { ascending: true });

      if (error) throw error;

      const result = speakers as Speaker[] || [];
      setCache(`${CACHE_KEY}-${currentUser.id}`, result);
      return result;
    },
    enabled: !!currentUser?.id,
    ...slowNetworkQueryOptions,
    placeholderData: () => currentUser?.id ? getCache<Speaker[]>(`${CACHE_KEY}-${currentUser.id}`) ?? undefined : undefined,
  });

  return { speakers, isLoading, error };
};

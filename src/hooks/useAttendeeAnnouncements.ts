
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getCache, setCache, slowNetworkQueryOptions } from '@/utils/queryCache';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'high' | 'normal' | 'low';
  send_immediately: boolean;
  image_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  event_id?: string;
  twitter_link?: string;
  instagram_link?: string;
  facebook_link?: string;
  tiktok_link?: string;
  website_link?: string;
  whatsapp_link?: string;
  vendor_form_id?: string | null;
  require_submission?: boolean | null;
}

const CACHE_KEY = 'attendee-announcements';

export const useAttendeeAnnouncements = () => {
  const { currentUser } = useAuth();

  const { data: announcements = [], isLoading, error } = useQuery({
    queryKey: ['attendee-announcements', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];

      const { data: profile } = await supabase
        .from('profiles')
        .select('current_event_id')
        .eq('id', currentUser.id)
        .single();

      if (!profile?.current_event_id) return [];

      const { data, error } = await supabase
        .from('announcements')
        .select('id, title, content, priority, send_immediately, image_url, created_at, event_id, twitter_link, instagram_link, facebook_link, tiktok_link, website_link, whatsapp_link, vendor_form_id, require_submission')
        .eq('event_id', profile.current_event_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const result = data as Announcement[];
      setCache(`${CACHE_KEY}-${currentUser.id}`, result);
      return result;
    },
    enabled: !!currentUser?.id,
    ...slowNetworkQueryOptions,
    placeholderData: () => currentUser?.id ? getCache<Announcement[]>(`${CACHE_KEY}-${currentUser.id}`) ?? undefined : undefined,
  });

  return { announcements, isLoading, error };
};

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAttendeeContext } from './useAttendeeContext';
import { Database } from '@/integrations/supabase/types';
import { getCache, setCache, slowNetworkQueryOptions } from '@/utils/queryCache';

type Highlight = Database['public']['Tables']['highlights']['Row'];
type HighlightMedia = Database['public']['Tables']['highlight_media']['Row'];

export interface HighlightWithMedia extends Highlight {
  highlight_media: HighlightMedia[];
}

const CACHE_KEY = 'attendee-highlights';

export const useAttendeeHighlights = () => {
  const { context } = useAttendeeContext();
  const currentEventId = context?.currentEventId;

  const { data: highlights = [], isLoading, error } = useQuery({
    queryKey: ['attendee-highlights', currentEventId],
    ...slowNetworkQueryOptions,
    placeholderData: () => currentEventId ? getCache<HighlightWithMedia[]>(`${CACHE_KEY}-${currentEventId}`) ?? undefined : undefined,
    queryFn: async (): Promise<HighlightWithMedia[]> => {
      if (!currentEventId) return [];

      // Fetch highlights and all media in parallel
      const [highlightsRes, mediaRes] = await Promise.all([
        supabase
          .from('highlights')
          .select('id, title, cover_image_url, category, display_order, is_published, event_id, created_at, updated_at, created_by')
          .eq('event_id', currentEventId)
          .eq('is_published', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('highlight_media')
          .select('*')
      ]);

      if (highlightsRes.error) throw highlightsRes.error;

      // Build media map
      const mediaMap: Record<string, HighlightMedia[]> = {};
      mediaRes.data?.forEach(m => {
        if (!mediaMap[m.highlight_id]) mediaMap[m.highlight_id] = [];
        mediaMap[m.highlight_id].push(m);
      });

      const highlightsWithMedia = (highlightsRes.data || []).map(h => ({
        ...h,
        highlight_media: (mediaMap[h.id] || []).sort((a, b) => a.media_order - b.media_order)
      })) as HighlightWithMedia[];

      setCache(`${CACHE_KEY}-${currentEventId}`, highlightsWithMedia);
      return highlightsWithMedia;
    },
    enabled: !!currentEventId,
  });

  return { highlights, isLoading, error };
};

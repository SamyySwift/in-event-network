import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAttendeeContext } from './useAttendeeContext';
import { Database } from '@/integrations/supabase/types';

type Highlight = Database['public']['Tables']['highlights']['Row'];
type HighlightMedia = Database['public']['Tables']['highlight_media']['Row'];

export interface HighlightWithMedia extends Highlight {
  highlight_media: HighlightMedia[];
}

export const useAttendeeHighlights = () => {
  const { context } = useAttendeeContext();
  const currentEventId = context?.currentEventId;

  const { data: highlights = [], isLoading, error } = useQuery({
    queryKey: ['attendee-highlights', currentEventId],
    queryFn: async (): Promise<HighlightWithMedia[]> => {
      if (!currentEventId) return [];

      const { data, error } = await supabase
        .from('highlights')
        .select('*')
        .eq('event_id', currentEventId)
        .eq('is_published', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Fetch media for each highlight
      const highlightsWithMedia = await Promise.all(
        (data || []).map(async (highlight) => {
          const { data: media } = await supabase
            .from('highlight_media')
            .select('*')
            .eq('highlight_id', highlight.id)
            .order('media_order');
          
          return {
            ...highlight,
            highlight_media: (media || []).sort((a, b) => a.media_order - b.media_order)
          };
        })
      );

      return highlightsWithMedia as HighlightWithMedia[];
    },
    enabled: !!currentEventId,
  });

  return {
    highlights,
    isLoading,
    error,
  };
};
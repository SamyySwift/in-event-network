import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface LiveStreamData {
  live_stream_url: string | null;
  is_live: boolean;
}

export const useLiveStream = (eventId: string | null) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['live-stream', eventId],
    queryFn: async (): Promise<LiveStreamData | null> => {
      if (!eventId) return null;

      const { data, error } = await supabase
        .from('events')
        .select('live_stream_url, is_live')
        .eq('id', eventId)
        .single();

      if (error) {
        console.error('Error fetching live stream data:', error);
        throw error;
      }

      return data as LiveStreamData;
    },
    enabled: !!eventId,
    staleTime: 30000, // 30 seconds
  });

  // Real-time subscription for live stream status changes
  useEffect(() => {
    if (!eventId) return;

    const channel = supabase
      .channel(`live-stream-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'events',
          filter: `id=eq.${eventId}`,
        },
        (payload) => {
          const newData = payload.new as any;
          queryClient.setQueryData(['live-stream', eventId], {
            live_stream_url: newData.live_stream_url,
            is_live: newData.is_live,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, queryClient]);

  const updateLiveStreamMutation = useMutation({
    mutationFn: async ({ url, isLive }: { url: string | null; isLive: boolean }) => {
      if (!eventId) throw new Error('No event ID');

      const { error } = await supabase
        .from('events')
        .update({
          live_stream_url: url,
          is_live: isLive,
        })
        .eq('id', eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-stream', eventId] });
    },
  });

  return {
    liveStreamUrl: data?.live_stream_url ?? null,
    isLive: data?.is_live ?? false,
    isLoading,
    error,
    updateLiveStream: updateLiveStreamMutation.mutate,
    isUpdating: updateLiveStreamMutation.isPending,
  };
};

// Helper to extract YouTube video ID from various URL formats
export const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // Handle youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  
  // Handle youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return shortMatch[1];
  
  // Handle youtube.com/embed/VIDEO_ID
  const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);
  if (embedMatch) return embedMatch[1];
  
  // Handle youtube.com/live/VIDEO_ID
  const liveMatch = url.match(/youtube\.com\/live\/([^?&]+)/);
  if (liveMatch) return liveMatch[1];
  
  return null;
};

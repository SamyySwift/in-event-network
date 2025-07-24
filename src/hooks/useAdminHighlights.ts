import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminEventContext } from './useAdminEventContext';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type Highlight = Database['public']['Tables']['highlights']['Row'];
type HighlightInsert = Database['public']['Tables']['highlights']['Insert'];
type HighlightUpdate = Database['public']['Tables']['highlights']['Update'];
type HighlightMedia = Database['public']['Tables']['highlight_media']['Row'];
type HighlightMediaInsert = Database['public']['Tables']['highlight_media']['Insert'];

export interface HighlightWithMedia extends Highlight {
  highlight_media: HighlightMedia[];
}

export const useAdminHighlights = () => {
  const { selectedEventId } = useAdminEventContext();
  const queryClient = useQueryClient();

  // Fetch highlights for the selected event
  const { data: highlights = [], isLoading, error } = useQuery({
    queryKey: ['admin-highlights', selectedEventId],
    queryFn: async (): Promise<HighlightWithMedia[]> => {
      if (!selectedEventId) return [];

      const { data, error } = await supabase
        .from('highlights')
        .select('*')
        .eq('event_id', selectedEventId)
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
            highlight_media: media || []
          };
        })
      );

      return highlightsWithMedia as HighlightWithMedia[];
    },
    enabled: !!selectedEventId,
  });

  // Create highlight mutation
  const createHighlight = useMutation({
    mutationFn: async (highlight: Omit<HighlightInsert, 'event_id'>) => {
      if (!selectedEventId) throw new Error('No event selected');

      const { data, error } = await supabase
        .from('highlights')
        .insert({
          ...highlight,
          event_id: selectedEventId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-highlights', selectedEventId] });
      toast.success('Highlight created successfully');
    },
    onError: (error) => {
      console.error('Error creating highlight:', error);
      toast.error('Failed to create highlight');
    },
  });

  // Update highlight mutation
  const updateHighlight = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: HighlightUpdate }) => {
      const { data, error } = await supabase
        .from('highlights')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-highlights', selectedEventId] });
      toast.success('Highlight updated successfully');
    },
    onError: (error) => {
      console.error('Error updating highlight:', error);
      toast.error('Failed to update highlight');
    },
  });

  // Delete highlight mutation
  const deleteHighlight = useMutation({
    mutationFn: async (id: string) => {
      // First delete all media associated with this highlight
      await supabase
        .from('highlight_media')
        .delete()
        .eq('highlight_id', id);

      // Then delete the highlight itself
      const { error } = await supabase
        .from('highlights')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-highlights', selectedEventId] });
      toast.success('Highlight deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting highlight:', error);
      toast.error('Failed to delete highlight');
    },
  });

  // Add media to highlight
  const addHighlightMedia = useMutation({
    mutationFn: async (media: Omit<HighlightMediaInsert, 'id'>) => {
      const { data, error } = await supabase
        .from('highlight_media')
        .insert(media)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-highlights', selectedEventId] });
      toast.success('Media added to highlight');
    },
    onError: (error) => {
      console.error('Error adding media:', error);
      toast.error('Failed to add media');
    },
  });

  // Remove media from highlight
  const removeHighlightMedia = useMutation({
    mutationFn: async (mediaId: string) => {
      const { error } = await supabase
        .from('highlight_media')
        .delete()
        .eq('id', mediaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-highlights', selectedEventId] });
      toast.success('Media removed from highlight');
    },
    onError: (error) => {
      console.error('Error removing media:', error);
      toast.error('Failed to remove media');
    },
  });

  // Update highlight order
  const updateHighlightOrder = useMutation({
    mutationFn: async (highlightOrders: { id: string; display_order: number }[]) => {
      const promises = highlightOrders.map(({ id, display_order }) =>
        supabase
          .from('highlights')
          .update({ display_order })
          .eq('id', id)
      );

      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-highlights', selectedEventId] });
      toast.success('Highlight order updated');
    },
    onError: (error) => {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    },
  });

  return {
    highlights,
    isLoading,
    error,
    createHighlight,
    updateHighlight,
    deleteHighlight,
    addHighlightMedia,
    removeHighlightMedia,
    updateHighlightOrder,
  };
};
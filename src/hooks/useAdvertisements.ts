import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  sponsor_name: string;
  sponsor_logo?: string;
  image_url?: string;
  link_url?: string;
  priority?: string;
  is_active: boolean;
  event_id?: string;
  created_by?: string;
  created_at: string;
  display_order?: number;
  start_date?: string;
  end_date?: string;
  twitter_link?: string;
  instagram_link?: string;
  linkedin_link?: string;
  facebook_link?: string;
  tiktok_link?: string;
  whatsapp_link?: string;
}

export const useAdvertisements = (eventId?: string) => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: advertisements = [], isLoading, error } = useQuery({
    queryKey: ['advertisements', eventId],
    queryFn: async () => {
      let query = supabase
        .from('advertisements')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (eventId) {
        query = query.or(`event_id.eq.${eventId},event_id.is.null`);
      } else {
        query = query.is('event_id', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching advertisements:', error);
        throw error;
      }

      // Filter by date range if applicable
      const now = new Date();
      return (data || []).filter((ad: any) => {
        const startDate = ad.start_date ? new Date(ad.start_date) : null;
        const endDate = ad.end_date ? new Date(ad.end_date) : null;

        if (startDate && now < startDate) return false;
        if (endDate && now > endDate) return false;

        return true;
      });
    },
    enabled: true,
  });

  const createAdvertisement = useMutation({
    mutationFn: async (newAd: Partial<Advertisement>) => {
      const { data, error } = await supabase
        .from('advertisements')
        .insert({
          ...newAd,
          created_by: currentUser?.id,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
      toast.success('Advertisement created successfully');
    },
    onError: (error) => {
      console.error('Error creating advertisement:', error);
      toast.error('Failed to create advertisement');
    },
  });

  const updateAdvertisement = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Advertisement> }) => {
      const { data, error } = await supabase
        .from('advertisements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
      toast.success('Advertisement updated successfully');
    },
    onError: (error) => {
      console.error('Error updating advertisement:', error);
      toast.error('Failed to update advertisement');
    },
  });

  const deleteAdvertisement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
      toast.success('Advertisement deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting advertisement:', error);
      toast.error('Failed to delete advertisement');
    },
  });

  return {
    advertisements,
    isLoading,
    error,
    createAdvertisement: createAdvertisement.mutate,
    updateAdvertisement: updateAdvertisement.mutate,
    deleteAdvertisement: deleteAdvertisement.mutate,
    isCreating: createAdvertisement.isPending,
    isUpdating: updateAdvertisement.isPending,
    isDeleting: deleteAdvertisement.isPending,
  };
};

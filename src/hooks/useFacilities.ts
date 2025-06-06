
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

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
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

export const useFacilities = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: facilities = [], isLoading, error } = useQuery({
    queryKey: ['facilities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Facility[];
    },
  });

  // Set up real-time subscription for facilities
  useEffect(() => {
    const channel = supabase
      .channel('facilities-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'facilities'
        },
        (payload) => {
          console.log('Real-time facilities update:', payload);
          queryClient.invalidateQueries({ queryKey: ['facilities'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createFacilityMutation = useMutation({
    mutationFn: async (facilityData: Omit<Facility, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('facilities')
        .insert({
          name: facilityData.name,
          description: facilityData.description,
          location: facilityData.location,
          rules: facilityData.rules,
          contact_type: facilityData.contact_type,
          contact_info: facilityData.contact_info,
          image_url: facilityData.image_url,
          icon_type: facilityData.icon_type,
          created_by: user.user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      toast({
        title: 'Facility Created',
        description: 'The facility has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create facility. Please try again.',
        variant: 'destructive',
      });
      console.error('Error creating facility:', error);
    },
  });

  const updateFacilityMutation = useMutation({
    mutationFn: async ({ id, ...facilityData }: Partial<Facility> & { id: string }) => {
      const { data, error } = await supabase
        .from('facilities')
        .update(facilityData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      toast({
        title: 'Facility Updated',
        description: 'The facility has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update facility. Please try again.',
        variant: 'destructive',
      });
      console.error('Error updating facility:', error);
    },
  });

  const deleteFacilityMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('facilities')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      toast({
        title: 'Facility Deleted',
        description: 'The facility has been removed successfully.',
        variant: 'destructive',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete facility. Please try again.',
        variant: 'destructive',
      });
      console.error('Error deleting facility:', error);
    },
  });

  return {
    facilities,
    isLoading,
    error,
    createFacility: createFacilityMutation.mutate,
    updateFacility: updateFacilityMutation.mutate,
    deleteFacility: deleteFacilityMutation.mutate,
    isCreating: createFacilityMutation.isPending,
    isUpdating: updateFacilityMutation.isPending,
    isDeleting: deleteFacilityMutation.isPending,
  };
};

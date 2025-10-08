import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  event_id: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  category?: 'facility' | 'exhibitor';
}

export const useFacilities = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: facilities = [], isLoading, error } = useQuery({
    queryKey: ['facilities', currentUser?.id],
    queryFn: async (): Promise<Facility[]> => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching facilities for user:', currentUser.id);

      // Get user's current event
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_event_id')
        .eq('id', currentUser.id)
        .single();

      if (!profile?.current_event_id) {
        console.log('User has no current event');
        return [];
      }

      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('event_id', profile.current_event_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching facilities:', error);
        throw error;
      }

      console.log('Facilities fetched:', data?.length || 0);
      return data as Facility[];
    },
    enabled: !!currentUser?.id,
  });

  const createFacilityMutation = useMutation({
    mutationFn: async (facilityData: Omit<Facility, 'id' | 'created_at' | 'updated_at'>) => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      if (!facilityData.event_id) {
        throw new Error('Event ID is required');
      }

      console.log('Creating facility:', facilityData);

      const { data, error } = await supabase
        .from('facilities')
        .insert({
          name: facilityData.name,
          description: facilityData.description,
          location: facilityData.location,
          rules: facilityData.rules,
          contact_type: facilityData.contact_type || 'none',
          contact_info: facilityData.contact_info,
          icon_type: facilityData.icon_type || 'building',
          event_id: facilityData.event_id,
          created_by: currentUser.id,
          category: (facilityData as any).category || 'facility',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating facility:', error);
        throw error;
      }
      
      console.log('Facility created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      toast({
        title: 'Facility Created',
        description: 'The facility has been created successfully.',
      });
    },
    onError: (error: any) => {
      console.error('Error creating facility:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create facility. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateFacilityMutation = useMutation({
    mutationFn: async ({ id, ...facilityData }: Partial<Facility> & { id: string }) => {
      console.log('Updating facility:', id, facilityData);
      
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('facilities')
        .update({ ...facilityData })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating facility:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      toast({
        title: 'Facility Updated',
        description: 'The facility has been updated successfully.',
      });
    },
    onError: (error: any) => {
      console.error('Error updating facility:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update facility. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteFacilityMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting facility:', id);
      
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('facilities')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting facility:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      toast({
        title: 'Facility Deleted',
        description: 'The facility has been removed successfully.',
        variant: 'destructive',
      });
    },
    onError: (error: any) => {
      console.error('Error deleting facility:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete facility. Please try again.',
        variant: 'destructive',
      });
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

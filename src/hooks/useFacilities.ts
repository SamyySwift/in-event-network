
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
      console.log('Fetching facilities...');
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching facilities:', error);
        throw error;
      }
      console.log('Facilities fetched successfully:', data);
      return data as Facility[];
    },
  });

  const createFacilityMutation = useMutation({
    mutationFn: async (facilityData: Omit<Facility, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating facility with data:', facilityData);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Clean the data - remove empty strings and undefined values
      const cleanData = {
        name: facilityData.name?.trim(),
        description: facilityData.description?.trim() || null,
        location: facilityData.location?.trim() || null,
        rules: facilityData.rules?.trim() || null,
        contact_type: facilityData.contact_type || 'none',
        contact_info: (facilityData.contact_type !== 'none' && facilityData.contact_info?.trim()) 
          ? facilityData.contact_info.trim() 
          : null,
        icon_type: facilityData.icon_type || 'building',
        created_by: user.user.id
      };

      console.log('Cleaned facility data:', cleanData);

      const { data, error } = await supabase
        .from('facilities')
        .insert(cleanData)
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
      
      // Clean the data - remove empty strings and undefined values
      const cleanData: any = {};
      if (facilityData.name?.trim()) cleanData.name = facilityData.name.trim();
      if (facilityData.description?.trim()) cleanData.description = facilityData.description.trim();
      if (facilityData.location?.trim()) cleanData.location = facilityData.location.trim();
      if (facilityData.rules?.trim()) cleanData.rules = facilityData.rules.trim();
      if (facilityData.contact_type) cleanData.contact_type = facilityData.contact_type;
      if (facilityData.contact_type !== 'none' && facilityData.contact_info?.trim()) {
        cleanData.contact_info = facilityData.contact_info.trim();
      } else if (facilityData.contact_type === 'none') {
        cleanData.contact_info = null;
      }
      if (facilityData.icon_type) cleanData.icon_type = facilityData.icon_type;

      const { data, error } = await supabase
        .from('facilities')
        .update(cleanData)
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

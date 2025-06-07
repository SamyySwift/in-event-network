import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Facility {
  id: string;
  name: string;
  description?: string;
  location?: string;
  rules?: string;
  image_url?: string;
  icon_type: string;
  contact_type: 'none' | 'phone' | 'email' | 'website';
  contact_info?: string;
  event_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useFacilities = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  const { data: facilities = [], isLoading, error } = useQuery({
    queryKey: ['facilities', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) {
        return [];
      }

      let query = supabase
        .from('facilities')
        .select('*')
        .order('name', { ascending: true });

      if (currentUser.role === 'host') {
        // Hosts see only their own facilities
        const { data: hostEvents } = await supabase
          .from('events')
          .select('id')
          .eq('host_id', currentUser.id);

        const eventIds = hostEvents?.map(e => e.id) || [];
        if (eventIds.length === 0) {
          return [];
        }
        query = query.in('event_id', eventIds);
      } else if (currentUser.role === 'attendee') {
        // Get the current user's profile to find their current event
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('current_event_id')
          .eq('id', currentUser.id)
          .single();

        if (profileError || !profile?.current_event_id) {
          console.error('Error fetching profile or no current event:', profileError);
          return [];
        }

        // Get the current event to find the host
        const { data: currentEvent, error: eventError } = await supabase
          .from('events')
          .select('host_id')
          .eq('id', profile.current_event_id)
          .single();

        if (eventError || !currentEvent?.host_id) {
          console.error('Error fetching current event:', eventError);
          return [];
        }

        // Get all events from the same host
        const { data: hostEvents, error: hostEventsError } = await supabase
          .from('events')
          .select('id')
          .eq('host_id', currentEvent.host_id);

        if (hostEventsError) {
          console.error('Error fetching host events:', hostEventsError);
          return [];
        }

        const eventIds = hostEvents?.map(e => e.id) || [];
        if (eventIds.length === 0) {
          return [];
        }
        query = query.in('event_id', eventIds);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching facilities:', error);
        throw error;
      }
      return data as Facility[];
    },
    enabled: !!currentUser,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const createFacilityMutation = useMutation({
    mutationFn: async (facilityData: Omit<Facility, 'id' | 'created_at' | 'updated_at'>) => {
      if (!currentUser || currentUser.role !== 'host') {
        throw new Error('Only hosts can create facilities');
      }

      const { data, error } = await supabase
        .from('facilities')
        .insert([{
          ...facilityData,
          created_by: currentUser.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Create facility error:', error);
        throw error;
      }

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
      console.error('Create facility error:', error);
      toast({
        title: 'Error',
        description: `Failed to create facility: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateFacilityMutation = useMutation({
    mutationFn: async ({ id, ...facilityData }: Partial<Facility> & { id: string }) => {
      if (!currentUser || currentUser.role !== 'host') {
        throw new Error('Only hosts can update facilities');
      }

      const { data, error } = await supabase
        .from('facilities')
        .update(facilityData)
        .eq('id', id)
        .eq('created_by', currentUser.id)
        .select()
        .single();

      if (error) {
        console.error('Update facility error:', error);
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
    onError: (error) => {
      console.error('Update facility error:', error);
      toast({
        title: 'Error',
        description: `Failed to update facility: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deleteFacilityMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentUser || currentUser.role !== 'host') {
        throw new Error('Only hosts can delete facilities');
      }

      const { error } = await supabase
        .from('facilities')
        .delete()
        .eq('id', id)
        .eq('created_by', currentUser.id);

      if (error) {
        console.error('Delete facility error:', error);
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
    onError: (error) => {
      console.error('Delete facility error:', error);
      toast({
        title: 'Error',
        description: `Failed to delete facility: ${error.message}`,
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

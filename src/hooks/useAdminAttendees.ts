import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { getCache, setCache, slowNetworkQueryOptions } from '@/utils/queryCache';

interface Attendee {
  id: string;
  event_id: string;
  user_id: string;
  created_at: string;
}

interface AttendeeWithProfile extends Attendee {
  name: string | null;
  email: string | null;
  role: string | null;
  event_name: string | null;
  joined_at: string;
}

const CACHE_KEY = 'admin-attendees';

export const useAdminAttendees = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const { selectedEventId } = useAdminEventContext();

  const { data: attendees = [], isLoading, error } = useQuery({
    queryKey: ['admin-attendees', selectedEventId],
    queryFn: async () => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      if (!selectedEventId) {
        return [];
      }

      // First verify that the current user owns this event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id, name, host_id')
        .eq('id', selectedEventId)
        .eq('host_id', currentUser.id)
        .single();

      if (eventError) {
        throw new Error('Event not found or access denied');
      }

      if (!event) {
        throw new Error('Event not found or you do not have permission to view its attendees');
      }

      // Use the RPC function to get attendees with profile information
      const { data, error } = await supabase.rpc('get_event_attendees_with_profiles', {
        p_event_id: selectedEventId
      });

      if (error) {
        // Fallback to manual query if RPC fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('event_participants')
          .select(`id, event_id, user_id, created_at, joined_at`)
          .eq('event_id', selectedEventId);

        if (fallbackError) throw fallbackError;

        const userIds = fallbackData?.map(p => p.user_id) || [];
        if (userIds.length === 0) return [];

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, email, role')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        const transformedData = fallbackData?.map((participant: any) => {
          const profile = profiles?.find(p => p.id === participant.user_id);
          return {
            id: participant.id,
            event_id: participant.event_id,
            user_id: participant.user_id,
            created_at: participant.created_at,
            name: profile?.name || 'Unknown User',
            email: profile?.email || 'No Email',
            role: profile?.role || 'attendee',
            event_name: event.name,
            joined_at: participant.joined_at || participant.created_at,
          };
        }) as AttendeeWithProfile[];

        setCache(`${CACHE_KEY}-${selectedEventId}`, transformedData);
        return transformedData;
      }

      const transformedData = data?.map((item: any) => ({
        id: item.id,
        event_id: item.event_id,
        user_id: item.user_id,
        created_at: item.created_at,
        name: item.name || 'Unknown User',
        email: item.email || 'No Email',
        role: item.role || 'attendee',
        event_name: item.event_name || event.name,
        joined_at: item.joined_at || item.created_at,
      })) as AttendeeWithProfile[];

      setCache(`${CACHE_KEY}-${selectedEventId}`, transformedData);
      return transformedData;
    },
    enabled: !!currentUser?.id && !!selectedEventId,
    placeholderData: () => getCache<AttendeeWithProfile[]>(`${CACHE_KEY}-${selectedEventId}`) || [],
    ...slowNetworkQueryOptions,
  });

  const addAttendeeMutation = useMutation({
    mutationFn: async (attendeeData: Omit<Attendee, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('event_participants')
        .insert([attendeeData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-attendees'] });
      toast({
        title: 'Success',
        description: 'Attendee has been added successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to add attendee: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deleteAttendeeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-attendees'] });
      toast({
        title: 'Success',
        description: 'Attendee has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete attendee: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const clearAttendeesMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id || !selectedEventId) {
        throw new Error('User not authenticated or no event selected');
      }

      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id')
        .eq('id', selectedEventId)
        .eq('host_id', currentUser.id)
        .single();

      if (eventError || !event) {
        throw new Error('Event not found or access denied');
      }

      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', selectedEventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-attendees'] });
      toast({
        title: 'Success',
        description: 'All attendees have been cleared from this event.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to clear attendees: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const bulkScanOutAll = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id || !selectedEventId) {
        throw new Error('User not authenticated or no event selected');
      }
      const { data, error } = await supabase.rpc('bulk_scan_out_attendees', {
        target_event_id: selectedEventId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-attendees'] });
      queryClient.invalidateQueries({ queryKey: ['admin-attendee-networking'] });
      queryClient.invalidateQueries({ queryKey: ['attendee-networking'] });
      toast({
        title: 'All attendees scanned out',
        description: 'Attendees are no longer active for this event.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to scan out attendees: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const bulkScanInAll = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id || !selectedEventId) {
        throw new Error('User not authenticated or no event selected');
      }
      const { data, error } = await supabase.rpc('bulk_scan_in_attendees', {
        target_event_id: selectedEventId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-attendees'] });
      queryClient.invalidateQueries({ queryKey: ['admin-attendee-networking'] });
      queryClient.invalidateQueries({ queryKey: ['attendee-networking'] });
      toast({
        title: 'All attendees scanned in',
        description: 'Attendees are now active for this event.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to scan in attendees: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    attendees,
    isLoading,
    error,
    addAttendee: addAttendeeMutation.mutate,
    deleteAttendee: deleteAttendeeMutation.mutate,
    clearAttendees: clearAttendeesMutation.mutateAsync,
    isAdding: addAttendeeMutation.isPending,
    isDeleting: deleteAttendeeMutation.isPending,
    isClearing: clearAttendeesMutation.isPending,
    bulkScanOutAll: bulkScanOutAll.mutateAsync,
    bulkScanInAll: bulkScanInAll.mutateAsync,
    isBulkScanning: bulkScanOutAll.isPending || bulkScanInAll.isPending,
  };
};

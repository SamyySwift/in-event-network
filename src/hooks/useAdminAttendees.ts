import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';

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
        console.log('No event selected, returning empty array');
        return [];
      }

      console.log('Fetching attendees for event:', selectedEventId);

      // First verify that the current user owns this event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id, name, host_id')
        .eq('id', selectedEventId)
        .eq('host_id', currentUser.id)
        .single();

      if (eventError) {
        console.error('Error verifying event ownership:', eventError);
        throw new Error('Event not found or access denied');
      }

      if (!event) {
        throw new Error('Event not found or you do not have permission to view its attendees');
      }

      // Use a raw SQL query to join the tables explicitly
      const { data, error } = await supabase.rpc('get_event_attendees_with_profiles', {
        p_event_id: selectedEventId
      });

      if (error) {
        console.error('Error fetching attendees with RPC:', error);
        // Fallback to manual query if RPC fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('event_participants')
          .select(`
            id,
            event_id,
            user_id,
            created_at,
            joined_at
          `)
          .eq('event_id', selectedEventId);

        if (fallbackError) {
          console.error('Fallback query also failed:', fallbackError);
          throw fallbackError;
        }

        // Get profile data separately
        const userIds = fallbackData?.map(p => p.user_id) || [];
        if (userIds.length === 0) {
          return [];
        }

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, email, role')
          .in('id', userIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          throw profilesError;
        }

        // Manually join the data
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

        console.log('Fallback transformed attendees data:', transformedData);
        return transformedData;
      }

      console.log('RPC attendees data:', data);
      return data as AttendeeWithProfile[];
    },
    enabled: !!currentUser?.id && !!selectedEventId,
  });

  const addAttendeeMutation = useMutation({
    mutationFn: async (attendeeData: Omit<Attendee, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('event_participants')
        .insert([attendeeData])
        .select()
        .single();

      if (error) {
        console.error('Error adding attendee:', error);
        throw error;
      }

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
      console.error('Add attendee error:', error);
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

      if (error) {
        console.error('Error deleting attendee:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-attendees'] });
      toast({
        title: 'Success',
        description: 'Attendee has been deleted successfully.',
      });
    },
    onError: (error) => {
      console.error('Delete attendee error:', error);
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

      // Verify event ownership before clearing attendees
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id')
        .eq('id', selectedEventId)
        .eq('host_id', currentUser.id)
        .single();

      if (eventError || !event) {
        throw new Error('Event not found or access denied');
      }

      // Clear attendees from the selected event
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', selectedEventId);

      if (error) {
        console.error('Error clearing attendees:', error);
        throw error;
      }

      console.log('Attendees cleared successfully for event:', selectedEventId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-attendees'] });
      toast({
        title: 'Success',
        description: 'All attendees have been cleared from this event.',
      });
    },
    onError: (error) => {
      console.error('Clear attendees error:', error);
      toast({
        title: 'Error',
        description: `Failed to clear attendees: ${error.message}`,
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
  };
};

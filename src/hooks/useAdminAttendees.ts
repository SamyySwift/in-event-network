
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

      // Fetch attendees for this specific event with profile information
      const { data, error } = await supabase
        .from('event_participants')
        .select(`
          id,
          event_id,
          user_id,
          created_at,
          joined_at,
          profiles (
            name,
            email,
            role
          )
        `)
        .eq('event_id', selectedEventId);

      if (error) {
        console.error('Error fetching attendees:', error);
        throw error;
      }

      console.log('Raw attendees data:', data);

      // Transform the data to match the expected interface
      const transformedData = data?.map((item: any) => ({
        id: item.id,
        event_id: item.event_id,
        user_id: item.user_id,
        created_at: item.created_at,
        name: item.profiles?.name || 'Unknown User',
        email: item.profiles?.email || 'No Email',
        role: item.profiles?.role || 'attendee',
        event_name: event.name,
        joined_at: item.joined_at || item.created_at,
      })) as AttendeeWithProfile[];

      console.log('Transformed attendees data:', transformedData);
      return transformedData;
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

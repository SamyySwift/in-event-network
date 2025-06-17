import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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

  const { data: attendees = [], isLoading, error } = useQuery({
    queryKey: ['admin-attendees'],
    queryFn: async () => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching attendees for user:', currentUser.id);

      // Get current user's events
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id')
        .eq('host_id', currentUser.id);

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        throw eventsError;
      }

      if (!events || events.length === 0) {
        console.log('No events found for user');
        return [];
      }

      const eventIds = events.map(event => event.id);
      console.log('Event IDs:', eventIds);

      // Fetch attendees from user's events with profile information
      const { data, error } = await supabase
        .from('event_participants')
        .select(`
          id,
          event_id,
          user_id,
          created_at,
          joined_at,
          profiles!event_participants_user_id_fkey(name, email, role),
          events!event_participants_event_id_fkey(name)
        `)
        .in('event_id', eventIds);

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
        event_name: item.events?.name || 'Unknown Event',
        joined_at: item.joined_at || item.created_at,
      })) as AttendeeWithProfile[];

      console.log('Transformed attendees data:', transformedData);
      return transformedData;
    },
    enabled: !!currentUser?.id,
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
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      // Get current user's events
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id')
        .eq('host_id', currentUser.id);

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        throw eventsError;
      }

      if (!events || events.length === 0) {
        console.log('No events found for user');
        return;
      }

      const eventIds = events.map(event => event.id);

      // Clear attendees from user's events
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .in('event_id', eventIds);

      if (error) {
        console.error('Error clearing attendees:', error);
        throw error;
      }

      console.log('Attendees cleared successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-attendees'] });
      toast({
        title: 'Success',
        description: 'All attendees have been cleared from your events.',
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

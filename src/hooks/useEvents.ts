
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Event {
  id: string;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  banner_url?: string;
  logo_url?: string;
  website?: string;
  event_key?: string;
  host_id?: string;
  created_at: string;
  updated_at: string;
}

export const useEvents = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['events', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) {
        return [];
      }

      if (currentUser.role === 'attendee') {
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
          .select('*')
          .eq('id', profile.current_event_id)
          .single();

        if (eventError || !currentEvent) {
          console.error('Error fetching current event:', eventError);
          return [];
        }

        // Get all events from the same host only
        const { data: hostEvents, error: hostEventsError } = await supabase
          .from('events')
          .select('*')
          .eq('host_id', currentEvent.host_id)
          .order('start_time', { ascending: true });

        if (hostEventsError) {
          console.error('Error fetching host events:', hostEventsError);
          throw hostEventsError;
        }

        return hostEvents as Event[];
      } else if (currentUser.role === 'host') {
        // Hosts see their own events
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('host_id', currentUser.id)
          .order('start_time', { ascending: true });

        if (error) {
          console.error('Error fetching events:', error);
          throw error;
        }
        return data as Event[];
      }

      return [];
    },
    enabled: !!currentUser,
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'event_key'>) => {
      if (!currentUser || currentUser.role !== 'host') {
        throw new Error('Only hosts can create events');
      }

      const { data, error } = await supabase
        .from('events')
        .insert([{
          ...eventData,
          host_id: currentUser.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Create event error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Event Created',
        description: 'The event has been created successfully.',
      });
    },
    onError: (error) => {
      console.error('Create event error:', error);
      toast({
        title: 'Error',
        description: `Failed to create event: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, ...eventData }: Partial<Event> & { id: string }) => {
      if (!currentUser || currentUser.role !== 'host') {
        throw new Error('Only hosts can update events');
      }

      const { data, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', id)
        .eq('host_id', currentUser.id)
        .select()
        .single();

      if (error) {
        console.error('Update event error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Event Updated',
        description: 'The event has been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Update event error:', error);
      toast({
        title: 'Error',
        description: `Failed to update event: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentUser || currentUser.role !== 'host') {
        throw new Error('Only hosts can delete events');
      }

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
        .eq('host_id', currentUser.id);

      if (error) {
        console.error('Delete event error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Event Deleted',
        description: 'The event has been removed successfully.',
        variant: 'destructive',
      });
    },
    onError: (error) => {
      console.error('Delete event error:', error);
      toast({
        title: 'Error',
        description: `Failed to delete event: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    events,
    isLoading,
    error,
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
  };
};

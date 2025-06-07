
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useJoinEvent = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  const joinEventMutation = useMutation({
    mutationFn: async (eventKey: string) => {
      try {
        if (!currentUser) {
          throw new Error('You must be logged in to join an event');
        }

        // Find the event by event key
        const { data: event, error: eventError } = await supabase
          .from('events')
          .select('id, name')
          .eq('event_key', eventKey)
          .single();

        if (eventError || !event) {
          throw new Error('Invalid event key. Please check and try again.');
        }

        // Update user's profile with current event
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ current_event_id: event.id })
          .eq('id', currentUser.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
          throw new Error('Failed to join event. Please try again.');
        }

        // Add user to event participants
        const { error: participantError } = await supabase
          .from('event_participants')
          .insert([{
            user_id: currentUser.id,
            event_id: event.id
          }]);

        if (participantError && participantError.code !== '23505') { // 23505 is unique constraint violation (already joined)
          console.error('Error adding participant:', participantError);
          throw new Error('Failed to join event. Please try again.');
        }

        return event;
      } catch (error) {
        console.error('Error in joinEventMutation:', error);
        throw error;
      }
    },
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: ['currentEvent'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Event Joined Successfully',
        description: `Welcome to ${event.name}!`,
      });
    },
    onError: (error) => {
      console.error('Join event error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    joinEvent: joinEventMutation.mutate,
    isJoining: joinEventMutation.isPending,
  };
};

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface JoinEventResponse {
  success: boolean;
  message?: string;
  event_id?: string;
  event_name?: string;
}

export const useJoinEvent = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  // Helper to store event info in localStorage for guest access
  const storeGuestEventInfo = (eventId: string, eventName: string) => {
    localStorage.setItem("guest_event_id", eventId);
    localStorage.setItem("guest_event_name", eventName);
    localStorage.setItem("guest_event_joined_at", new Date().toISOString());
  };

  const joinEventMutation = useMutation({
    mutationFn: async (accessCode: string) => {
      console.log('Attempting to join event with access code:', accessCode);
      
      if (currentUser) {
        // Authenticated user - use RPC function
        const { data, error } = await supabase.rpc('join_event_by_access_key', {
          access_code: accessCode
        });

        if (error) {
          console.error('Error joining event:', error);
          throw error;
        }

        console.log('Join event response:', data);
        return data as unknown as JoinEventResponse;
      } else {
        // Guest user - just fetch event info and store locally
        const { data: eventData, error } = await supabase
          .from('events')
          .select('id, name')
          .eq('event_key', accessCode)
          .single();

        if (error || !eventData) {
          throw new Error('Invalid event code');
        }

        storeGuestEventInfo(eventData.id, eventData.name);

        return {
          success: true,
          event_id: eventData.id,
          event_name: eventData.name,
        } as JoinEventResponse;
      }
    },
    onSuccess: (data) => {
      if (data?.success) {
        console.log('Successfully joined event, invalidating caches...');
        
        // Invalidate all networking-related queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['attendee-networking'] });
        queryClient.invalidateQueries({ queryKey: ['attendee-context'] });
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        
        // Force a refetch of networking data
        queryClient.refetchQueries({ queryKey: ['attendee-networking'] });
        
        
        // Navigate to attendee dashboard
        navigate('/attendee');
      } else {
        console.error('Join event failed:', data?.message);
        toast({
          title: 'Failed to Join Event',
          description: data?.message || 'Invalid access code',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      console.error('Join event error:', error);
      toast({
        title: 'Error Joining Event',
        description: error.message || 'Failed to join event. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    joinEvent: (accessCode: string, options?: { onSuccess?: (data: any) => void; onError?: (error: any) => void }) => {
      return joinEventMutation.mutate(accessCode, {
        onSuccess: options?.onSuccess,
        onError: options?.onError,
      });
    },
    isJoining: joinEventMutation.isPending,
  };
};


import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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

  const joinEventMutation = useMutation({
    mutationFn: async (accessCode: string) => {
      console.log('Attempting to join event with access code:', accessCode);
      
      const { data, error } = await supabase.rpc('join_event_by_access_key', {
        access_code: accessCode
      });

      if (error) {
        console.error('Error joining event:', error);
        throw error;
      }

      console.log('Join event response:', data);
      return data as unknown as JoinEventResponse;
    },
    onSuccess: (data) => {
      if (data?.success) {
        console.log('Successfully joined event, resetting attendee session and invalidating caches...');

        // Session reset: clear attendee-related caches to avoid residual data
        queryClient.removeQueries({
          predicate: (q) => {
            const key = Array.isArray(q.queryKey) ? String(q.queryKey[0]) : '';
            return (
              key === 'dashboard' ||
              key === 'current-event-id' ||
              key === 'is-participant' ||
              key === 'user-profile' ||
              key.startsWith('attendee-')
            );
          },
        });

        // Clear event-scoped localStorage entries
        const patterns = [
          /^announcementDismissed_/,
          /^announcementAcknowledged_/,
          /^vendor_form_submitted_/,
          /^poll_dismissed_/,
        ];
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (!k) continue;
          if (patterns.some((p) => p.test(k))) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));

        // Persist the active event id for verification across the app
        if (data?.event_id) {
          sessionStorage.setItem('active_event_id', data.event_id);
        }
        // Remove transient pending code
        sessionStorage.removeItem('pendingEventCode');
        localStorage.removeItem('pendingEventCode');

        // Invalidate commonly used queries that will be repopulated
        queryClient.invalidateQueries({ queryKey: ['attendee-context'] });
        queryClient.invalidateQueries({ queryKey: ['attendee-networking'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });

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

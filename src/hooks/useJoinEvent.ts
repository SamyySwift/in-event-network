
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
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
    onSuccess: async (data) => {
      if (data?.success) {
        console.log('Successfully joined event, invalidating caches...');
        
        // Invalidate all networking-related queries to refresh data
        await queryClient.invalidateQueries({ queryKey: ['attendee-networking'] });
        await queryClient.invalidateQueries({ queryKey: ['attendee-context'] });
        await queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        await queryClient.refetchQueries({ queryKey: ['attendee-context'] });
        await queryClient.refetchQueries({ queryKey: ['user-profile'] });

        // Navigate to attendee dashboard after data refresh
        navigate('/attendee/dashboard', { replace: true });
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


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
      console.log('useJoinEvent: Attempting to join event with access code:', accessCode);
      
      const { data, error } = await supabase.rpc('join_event_by_access_key', {
        access_code: accessCode
      });

      if (error) {
        console.error('useJoinEvent: Error joining event:', error);
        throw error;
      }

      console.log('useJoinEvent: Join event response:', data);
      return data as unknown as JoinEventResponse;
    },
    onSuccess: (data) => {
      if (data?.success) {
        console.log('useJoinEvent: Successfully joined event, invalidating caches...', data);
        
        // Invalidate all networking-related queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['attendee-networking'] });
        queryClient.invalidateQueries({ queryKey: ['attendee-context'] });
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        
        // Force a refetch of networking data
        queryClient.refetchQueries({ queryKey: ['attendee-networking'] });
        
        console.log('useJoinEvent: Event join successful, navigating to /attendee');
      } else {
        console.error('useJoinEvent: Join event failed:', data?.message);
      }
    },
    onError: (error: any) => {
      console.error('useJoinEvent: Join event error:', error);
    },
  });

  const joinEvent = (accessCode: string, options?: { 
    onSuccess?: (data: any) => void; 
    onError?: (error: any) => void;
    skipNavigation?: boolean;
  }) => {
    console.log('useJoinEvent: joinEvent called with accessCode:', accessCode, 'options:', options);
    
    return joinEventMutation.mutate(accessCode, {
      onSuccess: (data) => {
        console.log('useJoinEvent: Mutation success callback:', data);
        
        if (data?.success) {
          // Always show success toast unless explicitly disabled
          if (!options?.skipNavigation) {
            toast({
              title: 'Successfully Joined Event!',
              description: `Welcome to ${data.event_name}. You can now connect with other attendees.`,
            });
          }
          
          // Call custom success callback if provided
          if (options?.onSuccess) {
            console.log('useJoinEvent: Calling custom onSuccess callback');
            options.onSuccess(data);
          } else if (!options?.skipNavigation) {
            // Default navigation behavior
            console.log('useJoinEvent: Default navigation to /attendee');
            navigate('/attendee', { replace: true });
          }
        } else {
          // Handle join failure
          const errorMessage = data?.message || 'Invalid access code';
          console.error('useJoinEvent: Join failed with message:', errorMessage);
          
          toast({
            title: 'Failed to Join Event',
            description: errorMessage,
            variant: 'destructive',
          });
          
          if (options?.onError) {
            options.onError(new Error(errorMessage));
          }
        }
      },
      onError: (error) => {
        console.error('useJoinEvent: Mutation error callback:', error);
        
        // Always show error toast unless explicitly disabled
        if (!options?.skipNavigation) {
          toast({
            title: 'Error Joining Event',
            description: error.message || 'Failed to join event. Please try again.',
            variant: 'destructive',
          });
        }
        
        // Call custom error callback if provided
        if (options?.onError) {
          console.log('useJoinEvent: Calling custom onError callback');
          options.onError(error);
        }
      },
    });
  };

  return {
    joinEvent,
    isJoining: joinEventMutation.isPending,
  };
};

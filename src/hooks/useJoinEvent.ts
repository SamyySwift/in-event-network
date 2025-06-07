
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useJoinEvent = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

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
      return data;
    },
    onSuccess: (data) => {
      if (data?.success) {
        toast({
          title: 'Successfully Joined Event!',
          description: `Welcome to ${data.event_name}`,
        });
        // Navigate to attendee dashboard
        navigate('/dashboard');
      } else {
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
    joinEvent: joinEventMutation.mutate,
    isJoining: joinEventMutation.isPending,
  };
};

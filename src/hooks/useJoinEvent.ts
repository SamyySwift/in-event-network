
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useJoinEvent = () => {
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();
  const { refetchUser } = useAuth();

  const joinEventByAccessKey = async (accessKey: string) => {
    if (!accessKey.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an access code',
        variant: 'destructive',
      });
      return false;
    }

    setIsJoining(true);
    try {
      console.log('Attempting to join event with access key:', accessKey);

      // Call the database function to join event
      const { data, error } = await supabase.rpc('join_event_by_access_key', {
        access_code: accessKey.trim()
      });

      if (error) {
        console.error('Join event error:', error);
        throw error;
      }

      console.log('Join event response:', data);

      if (data?.success) {
        toast({
          title: 'Success!',
          description: `Welcome to ${data.event_name}!`,
        });
        
        // Refresh user data to get updated event info
        await refetchUser();
        return true;
      } else {
        toast({
          title: 'Invalid Access Code',
          description: data?.message || 'The access code you entered is not valid.',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error: any) {
      console.error('Join event error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to join event. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsJoining(false);
    }
  };

  return {
    joinEventByAccessKey,
    isJoining,
  };
};

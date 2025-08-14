import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useReferralCode = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  // Check if event is unlocked via referral code
  const { data: unlockedEvents = [], isLoading: isLoadingUnlocked, refetch: refetchUnlocked } = useQuery({
    queryKey: ['unlocked-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_access_codes')
        .select('event_id');

      if (error) {
        console.error('Error fetching unlocked events:', error);
        throw error;
      }

      return data.map(item => item.event_id);
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Submit referral code
  const submitReferralCodeMutation = useMutation({
    mutationFn: async ({ accessCode, eventId }: { accessCode: string; eventId: string }) => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Submitting referral code:', { accessCode, eventId });

      // Check if this code has already been used for this event
      const { data: existingCode, error: checkError } = await supabase
        .from('event_access_codes')
        .select('id')
        .eq('event_id', eventId)
        .eq('access_code', accessCode)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing code:', checkError);
        throw checkError;
      }

      if (existingCode) {
        // Code already exists, just return success
        return { success: true, message: 'Event features unlocked successfully!' };
      }

      // Insert new access code record
      const { data, error } = await supabase
        .from('event_access_codes')
        .insert([{
          event_id: eventId,
          access_code: accessCode,
          unlocked_by_user_id: currentUser.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error recording referral code:', error);
        throw error;
      }

      return { success: true, message: 'Event features unlocked successfully!', data };
    },
    onSuccess: async (result) => {
      // Invalidate and refetch queries
      await queryClient.invalidateQueries({ queryKey: ['unlocked-events'] });
      await queryClient.invalidateQueries({ queryKey: ['event-payments'] });
      await refetchUnlocked();
      
      toast({
        title: 'Success',
        description: result.message,
      });
    },
    onError: (error) => {
      console.error('Submit referral code error:', error);
      toast({
        title: 'Error',
        description: `Failed to unlock event: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Check if event is unlocked via referral code
  const isEventUnlockedByCode = (eventId: string) => {
    return unlockedEvents.includes(eventId);
  };

  return {
    unlockedEvents,
    isLoadingUnlocked,
    refetchUnlocked,
    submitReferralCode: submitReferralCodeMutation.mutate,
    isSubmittingCode: submitReferralCodeMutation.isPending,
    isEventUnlockedByCode,
  };
};
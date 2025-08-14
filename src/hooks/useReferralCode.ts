import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useReferralCode = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  // Get unlocked events from localStorage for anonymous users
  const getLocalUnlockedEvents = (): string[] => {
    try {
      const stored = localStorage.getItem('unlocked-events');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Save unlocked events to localStorage
  const saveLocalUnlockedEvents = (eventIds: string[]) => {
    try {
      localStorage.setItem('unlocked-events', JSON.stringify(eventIds));
    } catch (error) {
      console.error('Failed to save unlocked events to localStorage:', error);
    }
  };

  // Check if event is unlocked via referral code
  const { data: unlockedEvents = [], isLoading: isLoadingUnlocked, refetch: refetchUnlocked } = useQuery({
    queryKey: ['unlocked-events'],
    queryFn: async () => {
      // For anonymous users, use localStorage
      if (!currentUser?.id) {
        return getLocalUnlockedEvents();
      }

      // For authenticated users, fetch from database
      const { data, error } = await supabase
        .from('event_access_codes')
        .select('event_id')
        .eq('unlocked_by_user_id', currentUser.id);

      if (error) {
        console.error('Error fetching unlocked events:', error);
        throw error;
      }

      console.log('Fetched unlocked events from referral codes:', data);
      return data.map(item => item.event_id);
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Submit referral code
  const submitReferralCodeMutation = useMutation({
    mutationFn: async ({ accessCode, eventId }: { accessCode: string; eventId: string }) => {
      console.log('Submitting referral code:', { accessCode, eventId, userId: currentUser?.id || 'anonymous' });

      // Validate against the specific referral code
      const validReferralCode = '#Kconect09099';
      if (!accessCode || accessCode.trim() !== validReferralCode) {
        throw new Error('Invalid referral code. Please enter the correct code.');
      }

      // For anonymous users, use localStorage
      if (!currentUser?.id) {
        const currentUnlocked = getLocalUnlockedEvents();
        if (!currentUnlocked.includes(eventId)) {
          const updatedUnlocked = [...currentUnlocked, eventId];
          saveLocalUnlockedEvents(updatedUnlocked);
        }
        return { success: true, message: 'Event features unlocked successfully!' };
      }

      // For authenticated users, use database
      // Check if this code has already been used for this event by this user
      const { data: existingCode, error: checkError } = await supabase
        .from('event_access_codes')
        .select('id')
        .eq('event_id', eventId)
        .eq('access_code', accessCode)
        .eq('unlocked_by_user_id', currentUser.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing code:', checkError);
        throw checkError;
      }

      if (existingCode) {
        // Code already exists for this user, just return success
        return { success: true, message: 'Event features already unlocked!' };
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
    const isUnlocked = unlockedEvents.includes(eventId);
    console.log('Checking if event is unlocked by referral code:', { eventId, unlockedEvents, isUnlocked });
    return isUnlocked;
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
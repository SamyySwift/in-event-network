
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface PaymentRecord {
  id: string;
  event_id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed';
  paystack_reference: string;
  created_at: string;
  updated_at: string;
}

export const usePayment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  // Check if user has paid for a specific event
  const { data: eventPayments = [], isLoading: isLoadingPayments, refetch: refetchPayments } = useQuery({
    queryKey: ['event-payments', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];

      console.log('Fetching payment records for user:', currentUser.id);

      const { data, error } = await supabase
        .from('event_payments')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('status', 'success');

      if (error) {
        console.error('Error fetching payment records:', error);
        throw error;
      }

      console.log('Payment records fetched:', data);
      return data as PaymentRecord[];
    },
    enabled: !!currentUser?.id,
    staleTime: 0, // Always refetch to get latest payment status
    refetchOnWindowFocus: true,
  });

  // Record payment in database
  const recordPaymentMutation = useMutation({
    mutationFn: async (paymentData: {
      eventId: string;
      amount: number;
      currency: string;
      reference: string;
      status: 'pending' | 'success' | 'failed';
    }) => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Recording payment:', paymentData);

      const { data, error } = await supabase
        .from('event_payments')
        .insert([{
          event_id: paymentData.eventId,
          user_id: currentUser.id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          paystack_reference: paymentData.reference,
          status: paymentData.status,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error recording payment:', error);
        throw error;
      }

      return data;
    },
    onSuccess: async () => {
      // Invalidate and refetch payment queries immediately
      await queryClient.invalidateQueries({ queryKey: ['event-payments'] });
      await queryClient.refetchQueries({ queryKey: ['event-payments', currentUser?.id] });
      
      toast({
        title: 'Payment Recorded',
        description: 'Payment has been successfully recorded.',
      });
    },
    onError: (error) => {
      console.error('Record payment error:', error);
      toast({
        title: 'Error',
        description: `Failed to record payment: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update payment status
  const updatePaymentStatusMutation = useMutation({
    mutationFn: async ({ reference, status }: { reference: string; status: 'success' | 'failed' }) => {
      console.log('Updating payment status:', { reference, status });

      const { data, error } = await supabase
        .from('event_payments')
        .update({ status })
        .eq('paystack_reference', reference)
        .select()
        .single();

      if (error) {
        console.error('Error updating payment status:', error);
        throw error;
      }

      return data;
    },
    onSuccess: async () => {
      // Invalidate and refetch payment queries immediately
      await queryClient.invalidateQueries({ queryKey: ['event-payments'] });
      await queryClient.refetchQueries({ queryKey: ['event-payments', currentUser?.id] });
    },
  });

  // Check if event is paid for
  const isEventPaid = (eventId: string) => {
    const isPaid = eventPayments.some(payment => payment.event_id === eventId && payment.status === 'success');
    console.log('Checking if event is paid:', { eventId, isPaid, eventPayments });
    return isPaid;
  };

  // Unified check for event access (payment OR referral code)
  // This uses the referral code hook to avoid duplicate queries
  const isEventUnlocked = (eventId: string) => {
    const isPaid = isEventPaid(eventId);
    console.log('Checking if event is unlocked via payment:', { eventId, isPaid });
    return isPaid;
  };

  // Get payment amount (₦100,000 as specified in the landing page)
  const getPaymentAmount = () => 10000000; // 100,000 NGN in kobo (Paystack uses kobo)

  return {
    eventPayments,
    isLoadingPayments,
    refetchPayments,
    recordPayment: recordPaymentMutation.mutate,
    updatePaymentStatus: updatePaymentStatusMutation.mutate,
    isRecordingPayment: recordPaymentMutation.isPending,
    isUpdatingPayment: updatePaymentStatusMutation.isPending,
    isEventPaid,
    isEventUnlocked,
    getPaymentAmount,
  };
};

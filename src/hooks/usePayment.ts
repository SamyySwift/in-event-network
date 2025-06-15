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
  const { data: eventPayments = [], isLoading: isLoadingPayments } = useQuery({
    queryKey: ['event-payments', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];

      const { data, error } = await supabase
        .from('event_payments')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('status', 'success');

      if (error) {
        console.error('Error fetching payment records:', error);
        throw error;
      }

      return data as PaymentRecord[];
    },
    enabled: !!currentUser?.id,
  });

  // Check payment status for a specific event and user
  const checkPaymentStatus = async (eventId: string, userId: string) => {
    const { data, error } = await supabase
      .from('event_payments')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .eq('status', 'success')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking payment status:', error);
      return null;
    }

    return data;
  };

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-payments'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-payments'] });
    },
  });

  // Check if event is paid for
  const isEventPaid = (eventId: string) => {
    return eventPayments.some(payment => payment.event_id === eventId && payment.status === 'success');
  };

  // Get payment amount (₦30,000 as specified in the landing page)
  const getPaymentAmount = () => 3000000; // 30,000 NGN in kobo (Paystack uses kobo)

  return {
    eventPayments,
    isLoadingPayments,
    recordPayment: recordPaymentMutation.mutate,
    updatePaymentStatus: updatePaymentStatusMutation.mutate,
    isRecordingPayment: recordPaymentMutation.isPending,
    isUpdatingPayment: updatePaymentStatusMutation.isPending,
    isEventPaid,
    getPaymentAmount,
    checkPaymentStatus,
  };
};

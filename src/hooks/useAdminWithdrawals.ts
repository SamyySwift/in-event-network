
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WithdrawalRequest {
  id: string;
  admin_wallet_id: string;
  amount: number;
  amount_naira: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paystack_transfer_code?: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  failure_reason?: string;
  processed_at?: string;
  created_at: string;
}

interface Bank {
  id: number;
  name: string;
  code: string;
  country: string;
}

interface AccountVerificationResult {
  success: boolean;
  account_name: string;
  message: string;
}

export const useAdminWithdrawals = () => {
  const { selectedEventId } = useAdminEventContext();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch withdrawal history
  const { data: withdrawalHistory = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['withdrawal-history', currentUser?.id, selectedEventId],
    queryFn: async (): Promise<WithdrawalRequest[]> => {
      if (!currentUser?.id || !selectedEventId) return [];

      console.log('Fetching withdrawal history for user:', currentUser.id, 'event:', selectedEventId);

      const { data: wallet } = await supabase
        .from('admin_wallets')
        .select('id')
        .eq('admin_id', currentUser.id)
        .eq('event_id', selectedEventId)
        .single();

      if (!wallet) {
        console.log('No wallet found for user');
        return [];
      }

      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('admin_wallet_id', wallet.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching withdrawal history:', error);
        throw error;
      }

      console.log('Withdrawal history fetched:', data?.length, 'records');
      return data as WithdrawalRequest[];
    },
    enabled: !!currentUser?.id && !!selectedEventId,
  });

  // Fetch Nigerian banks
  const { data: banks = [], isLoading: isLoadingBanks } = useQuery({
    queryKey: ['nigerian-banks'],
    queryFn: async (): Promise<Bank[]> => {
      console.log('Fetching Nigerian banks...');
      
      const { data, error } = await supabase.functions.invoke('process-withdrawal', {
        body: { action: 'get_banks' }
      });

      if (error) {
        console.error('Error fetching banks:', error);
        throw error;
      }

      console.log('Banks fetched successfully:', data?.data?.length, 'banks');
      return data?.data || [];
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  // Verify bank account
  const verifyAccount = useMutation({
    mutationFn: async ({ accountNumber, bankCode, bankName }: {
      accountNumber: string;
      bankCode: string;
      bankName: string;
    }): Promise<AccountVerificationResult> => {
      if (!selectedEventId) {
        throw new Error('No event selected');
      }

      console.log('Verifying account:', { accountNumber, bankCode, bankName });

      const { data, error } = await supabase.functions.invoke('process-withdrawal', {
        body: {
          action: 'verify_account',
          account_number: accountNumber,
          bank_code: bankCode,
          bank_name: bankName,
          event_id: selectedEventId,
        }
      });

      if (error) {
        console.error('Account verification error:', error);
        throw new Error(error.message || 'Failed to verify account');
      }

      if (!data?.success) {
        console.error('Account verification failed:', data);
        throw new Error(data?.message || 'Account verification failed');
      }

      console.log('Account verified successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-wallet'] });
      toast({
        title: 'Success',
        description: `Account verified: ${data.account_name}`,
      });
    },
    onError: (error: any) => {
      console.error('Account verification failed:', error);
      toast({
        title: 'Verification Failed',
        description: error.message || 'Failed to verify bank account',
        variant: 'destructive',
      });
    },
  });

  // Create recipient
  const createRecipient = useMutation({
    mutationFn: async ({ accountName, accountNumber, bankCode }: {
      accountName: string;
      accountNumber: string;
      bankCode: string;
    }) => {
      if (!selectedEventId) {
        throw new Error('No event selected');
      }

      console.log('Creating recipient:', { accountName, accountNumber, bankCode });

      const { data, error } = await supabase.functions.invoke('process-withdrawal', {
        body: {
          action: 'create_recipient',
          account_name: accountName,
          account_number: accountNumber,
          bank_code: bankCode,
          event_id: selectedEventId,
        }
      });

      if (error) {
        console.error('Recipient creation error:', error);
        throw new Error(error.message || 'Failed to create recipient');
      }

      if (!data?.success) {
        console.error('Recipient creation failed:', data);
        throw new Error(data?.message || 'Failed to create recipient');
      }

      console.log('Recipient created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-wallet'] });
      toast({
        title: 'Success',
        description: 'Bank recipient created successfully',
      });
    },
    onError: (error: any) => {
      console.error('Recipient creation failed:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create recipient',
        variant: 'destructive',
      });
    },
  });

  // Initiate withdrawal
  const initiateWithdrawal = useMutation({
    mutationFn: async ({ 
      walletId, 
      amount, 
      bankName, 
      accountNumber, 
      accountName, 
      recipientCode,
      currentBalance,
      totalWithdrawn
    }: {
      walletId: string;
      amount: number;
      bankName: string;
      accountNumber: string;
      accountName: string;
      recipientCode: string;
      currentBalance: number;
      totalWithdrawn: number;
    }) => {
      console.log('Initiating withdrawal:', { 
        walletId, 
        amount, 
        bankName, 
        accountNumber, 
        accountName,
        currentBalance,
        totalWithdrawn
      });

      // Validate withdrawal amount
      if (amount <= 0) {
        throw new Error('Withdrawal amount must be greater than zero');
      }

      if (amount > currentBalance) {
        throw new Error('Insufficient balance for withdrawal');
      }

      // Check minimum withdrawal amount (₦100)
      if (amount < 100) {
        throw new Error('Minimum withdrawal amount is ₦100');
      }

      const { data, error } = await supabase.functions.invoke('process-withdrawal', {
        body: {
          action: 'initiate_transfer',
          wallet_id: walletId,
          amount,
          bank_name: bankName,
          account_number: accountNumber,
          account_name: accountName,
          recipient_code: recipientCode,
          new_balance: currentBalance - amount,
          total_withdrawn: totalWithdrawn + amount,
        }
      });

      if (error) {
        console.error('Withdrawal initiation error:', error);
        throw new Error(error.message || 'Failed to process withdrawal');
      }

      if (!data?.success) {
        console.error('Withdrawal initiation failed:', data);
        throw new Error(data?.error || 'Withdrawal failed');
      }

      console.log('Withdrawal initiated successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawal-history'] });
      toast({
        title: 'Withdrawal Initiated',
        description: data.message || 'Your withdrawal request has been processed',
      });
    },
    onError: (error: any) => {
      console.error('Withdrawal failed:', error);
      toast({
        title: 'Withdrawal Failed',
        description: error.message || 'Failed to process withdrawal',
        variant: 'destructive',
      });
    },
  });

  return {
    withdrawalHistory,
    isLoadingHistory,
    banks,
    isLoadingBanks,
    verifyAccount,
    createRecipient,
    initiateWithdrawal,
    isVerifyingAccount: verifyAccount.isPending,
    isCreatingRecipient: createRecipient.isPending,
    isInitiatingWithdrawal: initiateWithdrawal.isPending,
  };
};

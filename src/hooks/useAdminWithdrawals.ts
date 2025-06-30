
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WithdrawalRequest {
  id: string;
  admin_wallet_id: string;
  amount: number;
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

      const { data: wallet } = await supabase
        .from('admin_wallets')
        .select('id')
        .eq('admin_id', currentUser.id)
        .eq('event_id', selectedEventId)
        .single();

      if (!wallet) return [];

      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('admin_wallet_id', wallet.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WithdrawalRequest[];
    },
    enabled: !!currentUser?.id && !!selectedEventId,
  });

  // Fetch Nigerian banks
  const { data: banks = [], isLoading: isLoadingBanks } = useQuery({
    queryKey: ['nigerian-banks'],
    queryFn: async (): Promise<Bank[]> => {
      const { data, error } = await supabase.functions.invoke('process-withdrawal', {
        body: { action: 'get_banks' }
      });

      if (error) throw error;
      return data.data || [];
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  // Verify bank account
  const verifyAccount = useMutation({
    mutationFn: async ({ accountNumber, bankCode, bankName }: {
      accountNumber: string;
      bankCode: string;
      bankName: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('process-withdrawal', {
        body: {
          action: 'verify_account',
          account_number: accountNumber,
          bank_code: bankCode,
          bank_name: bankName,
          event_id: selectedEventId,
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wallet'] });
      toast({
        title: 'Success',
        description: 'Bank account verified successfully',
      });
    },
    onError: (error: any) => {
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
      const { data, error } = await supabase.functions.invoke('process-withdrawal', {
        body: {
          action: 'create_recipient',
          account_name: accountName,
          account_number: accountNumber,
          bank_code: bankCode,
          event_id: selectedEventId,
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wallet'] });
      toast({
        title: 'Success',
        description: 'Bank recipient created successfully',
      });
    },
    onError: (error: any) => {
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
          total_withdrawn: totalWithdrawn,
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawal-history'] });
      toast({
        title: 'Withdrawal Initiated',
        description: 'Your withdrawal request has been processed',
      });
    },
    onError: (error: any) => {
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

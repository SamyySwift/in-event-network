
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AdminWallet {
  id: string;
  admin_id: string;
  event_id: string;
  available_balance: number;
  total_earnings: number;
  withdrawn_amount: number;
  last_payout_at: string | null;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
  bank_code: string | null;
  recipient_code: string | null;
  is_bank_verified: boolean;
  minimum_payout_amount: number;
  created_at: string;
  updated_at: string;
}

export const useAdminWallet = () => {
  const { selectedEventId } = useAdminEventContext();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch wallet data for current admin and event
  const { data: wallet, isLoading, error } = useQuery({
    queryKey: ['admin-wallet', currentUser?.id, selectedEventId],
    queryFn: async (): Promise<AdminWallet | null> => {
      if (!currentUser?.id || !selectedEventId) return null;

      const { data, error } = await supabase
        .from('admin_wallets')
        .select('*')
        .eq('admin_id', currentUser.id)
        .eq('event_id', selectedEventId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    },
    enabled: !!currentUser?.id && !!selectedEventId,
  });

  // Create wallet mutation
  const createWallet = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id || !selectedEventId) {
        throw new Error('Missing required data');
      }

      const { data, error } = await supabase
        .from('admin_wallets')
        .insert({
          admin_id: currentUser.id,
          event_id: selectedEventId,
          available_balance: 0,
          total_earnings: 0,
          withdrawn_amount: 0,
          minimum_payout_amount: 100000, // 1000 NGN minimum
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wallet'] });
      toast({
        title: 'Success',
        description: 'Wallet created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create wallet: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  // Legacy withdraw funds mutation (kept for backward compatibility)
  const withdrawFunds = useMutation({
    mutationFn: async (amount: number) => {
      if (!wallet || amount > wallet.available_balance) {
        throw new Error('Insufficient balance');
      }

      const { data, error } = await supabase
        .from('admin_wallets')
        .update({
          available_balance: wallet.available_balance - amount,
          withdrawn_amount: wallet.withdrawn_amount + amount,
          last_payout_at: new Date().toISOString(),
        })
        .eq('id', wallet.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wallet'] });
      toast({
        title: 'Success',
        description: 'Withdrawal successful',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Withdrawal failed: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    wallet,
    isLoading,
    error,
    createWallet,
    withdrawFunds,
    hasWallet: !!wallet,
  };
};

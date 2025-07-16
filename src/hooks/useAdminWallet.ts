
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

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

      console.log('Fetching wallet for admin:', currentUser.id, 'event:', selectedEventId);

      const { data, error } = await supabase
        .from('admin_wallets')
        .select('*')
        .eq('admin_id', currentUser.id)
        .eq('event_id', selectedEventId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching wallet:', error);
        throw error;
      }

      console.log('Wallet fetched:', data);
      return data;
    },
    enabled: !!currentUser?.id && !!selectedEventId,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  // Set up real-time subscription for wallet updates
  useEffect(() => {
    if (!currentUser?.id || !selectedEventId) return;

    console.log('Setting up real-time subscription for wallet updates');

    const channel = supabase
      .channel('admin-wallet-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_wallets',
          filter: `admin_id=eq.${currentUser.id}`,
        },
        (payload) => {
          console.log('Wallet updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['admin-wallet'] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up wallet subscription');
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, selectedEventId, queryClient]);

  // Set up real-time subscription for new ticket purchases
  useEffect(() => {
    if (!currentUser?.id || !selectedEventId) return;

    console.log('Setting up real-time subscription for ticket purchases');

    const channel = supabase
      .channel('ticket-purchase-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_tickets',
          filter: `event_id=eq.${selectedEventId}`,
        },
        (payload) => {
          console.log('New ticket purchased:', payload);
          // Invalidate wallet query to fetch updated balance
          queryClient.invalidateQueries({ queryKey: ['admin-wallet'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'event_tickets',
          filter: `event_id=eq.${selectedEventId}`,
        },
        (payload) => {
          console.log('Ticket updated:', payload);
          // Only invalidate if payment status changed to completed
          if (payload.new?.payment_status === 'completed' && 
              payload.old?.payment_status !== 'completed') {
            queryClient.invalidateQueries({ queryKey: ['admin-wallet'] });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up ticket subscription');
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, selectedEventId, queryClient]);

  // Create wallet mutation
  const createWallet = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id || !selectedEventId) {
        throw new Error('Missing required data');
      }

      console.log('Creating wallet for admin:', currentUser.id, 'event:', selectedEventId);

      const { data, error } = await supabase
        .from('admin_wallets')
        .insert({
          admin_id: currentUser.id,
          event_id: selectedEventId,
          available_balance: 0,
          total_earnings: 0,
          withdrawn_amount: 0,
          minimum_payout_amount: 10000, // ₦100 minimum (in kobo, but we store in naira now)
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating wallet:', error);
        throw error;
      }

      console.log('Wallet created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wallet'] });
      toast({
        title: 'Success',
        description: 'Wallet created successfully',
      });
    },
    onError: (error: any) => {
      console.error('Failed to create wallet:', error);
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

      console.log('Legacy withdrawal - amount:', amount);

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

      if (error) {
        console.error('Error in legacy withdrawal:', error);
        throw error;
      }

      console.log('Legacy withdrawal successful:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wallet'] });
      toast({
        title: 'Success',
        description: 'Withdrawal successful',
      });
    },
    onError: (error: any) => {
      console.error('Legacy withdrawal failed:', error);
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

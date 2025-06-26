
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type AdminWallet = {
  id: string;
  admin_id: string;
  event_id: string;
  total_earnings: number;
  available_balance: number;
  withdrawn_amount: number;
  last_payout_at?: string;
  created_at: string;
  updated_at: string;
};

export const useAdminWallet = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get admin's wallets
  const useAdminWallets = () => {
    return useQuery({
      queryKey: ['admin-wallets'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('admin_wallets')
          .select(`
            *,
            events(name, start_time, end_time)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
      },
    });
  };

  // Get wallet for specific event
  const useEventWallet = (eventId: string) => {
    return useQuery({
      queryKey: ['event-wallet', eventId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('admin_wallets')
          .select(`
            *,
            events(name)
          `)
          .eq('event_id', eventId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
      },
      enabled: !!eventId,
    });
  };

  // Get wallet summary
  const useWalletSummary = () => {
    return useQuery({
      queryKey: ['wallet-summary'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('admin_wallets')
          .select('total_earnings, available_balance, withdrawn_amount');

        if (error) throw error;

        const summary = data.reduce(
          (acc, wallet) => ({
            total_earnings: acc.total_earnings + wallet.total_earnings,
            available_balance: acc.available_balance + wallet.available_balance,
            withdrawn_amount: acc.withdrawn_amount + wallet.withdrawn_amount,
          }),
          { total_earnings: 0, available_balance: 0, withdrawn_amount: 0 }
        );

        return summary;
      },
    });
  };

  // Request payout
  const requestPayout = useMutation({
    mutationFn: async ({
      eventId,
      amount
    }: {
      eventId: string;
      amount: number;
    }) => {
      // Update wallet balance
      const { data, error } = await supabase
        .from('admin_wallets')
        .update({
          available_balance: 0,
          withdrawn_amount: amount,
          last_payout_at: new Date().toISOString(),
        })
        .eq('event_id', eventId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Payout Requested",
        description: "Your payout request has been submitted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-wallets'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-summary'] });
    },
    onError: (error) => {
      toast({
        title: "Payout Failed",
        description: "Failed to request payout. Please try again.",
        variant: "destructive",
      });
      console.error('Payout error:', error);
    },
  });

  return {
    useAdminWallets,
    useEventWallet,
    useWalletSummary,
    requestPayout,
  };
};

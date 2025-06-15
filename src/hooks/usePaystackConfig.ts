
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePaystackConfig = () => {
  const { data: config, isLoading } = useQuery({
    queryKey: ['paystack-config'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-paystack-config');
      
      if (error) {
        console.error('Error fetching Paystack config:', error);
        throw error;
      }
      
      return data;
    },
  });

  return {
    publicKey: config?.publicKey || '',
    isLoading,
  };
};

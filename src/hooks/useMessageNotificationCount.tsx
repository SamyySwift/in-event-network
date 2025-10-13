import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to count unread connection requests and messages
 * Excludes general notifications
 */
export const useMessageNotificationCount = () => {
  const { currentUser } = useAuth();
  const [count, setCount] = useState(0);

  const fetchCount = async () => {
    if (!currentUser?.id) {
      setCount(0);
      return;
    }

    try {
      // Count pending connection requests
      const { count: connectionCount } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', currentUser.id)
        .eq('status', 'pending');

      // Count unread direct messages
      const { count: dmCount } = await supabase
        .from('direct_messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', currentUser.id)
        .eq('is_read', false);

      const totalCount = (connectionCount || 0) + (dmCount || 0);
      setCount(totalCount);
    } catch (error) {
      console.error('Error fetching message notification count:', error);
      setCount(0);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchCount();

      // Set up real-time subscriptions for connections
      const connectionsChannel = supabase
        .channel('message-notifications-connections')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'connections',
            filter: `recipient_id=eq.${currentUser.id}`
          },
          () => {
            fetchCount();
          }
        )
        .subscribe();

      // Set up real-time subscriptions for direct messages
      const dmChannel = supabase
        .channel('message-notifications-dm')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'direct_messages',
            filter: `recipient_id=eq.${currentUser.id}`
          },
          () => {
            fetchCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(connectionsChannel);
        supabase.removeChannel(dmChannel);
      };
    }
  }, [currentUser]);

  return { 
    count,
    refetch: fetchCount 
  };
};

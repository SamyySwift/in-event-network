import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UnreadCounts {
  unreadMessages: number;
  unreadChats: number;
}

export const useUnreadMessageCounts = (eventId?: string) => {
  const { currentUser } = useAuth();
  const [counts, setCounts] = useState<UnreadCounts>({ unreadMessages: 0, unreadChats: 0 });
  const [loading, setLoading] = useState(true);

  const fetchUnreadCounts = useCallback(async () => {
    if (!currentUser?.id) {
      setCounts({ unreadMessages: 0, unreadChats: 0 });
      setLoading(false);
      return;
    }

    try {
      // Count unread direct messages where current user is recipient
      const { count: unreadDMs, error: dmError } = await supabase
        .from('direct_messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', currentUser.id)
        .eq('is_read', false);

      if (dmError) {
        console.error('Error fetching unread DM count:', dmError);
      }

      // For chat rooms, we could track last seen timestamp in localStorage
      // For now, we'll just track DMs since chat room tracking is more complex
      let unreadChatCount = 0;
      
      if (eventId) {
        const lastSeenKey = `chat_last_seen_${eventId}_${currentUser.id}`;
        const lastSeen = localStorage.getItem(lastSeenKey);
        
        if (lastSeen) {
          const { count: chatCount, error: chatError } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', eventId)
            .neq('user_id', currentUser.id)
            .gt('created_at', lastSeen);

          if (!chatError) {
            unreadChatCount = chatCount || 0;
          }
        }
      }

      setCounts({
        unreadMessages: unreadDMs || 0,
        unreadChats: unreadChatCount
      });
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, eventId]);

  // Mark chat as seen (call when user opens Chat Room tab)
  const markChatAsSeen = useCallback(() => {
    if (!currentUser?.id || !eventId) return;
    const lastSeenKey = `chat_last_seen_${eventId}_${currentUser.id}`;
    localStorage.setItem(lastSeenKey, new Date().toISOString());
    setCounts(prev => ({ ...prev, unreadChats: 0 }));
  }, [currentUser?.id, eventId]);

  // Initial fetch
  useEffect(() => {
    fetchUnreadCounts();
  }, [fetchUnreadCounts]);

  // Real-time subscription for direct messages
  useEffect(() => {
    if (!currentUser?.id) return;

    const channel = supabase
      .channel('unread-counts-dm')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `recipient_id=eq.${currentUser.id}`
        },
        () => {
          // Increment unread messages count
          setCounts(prev => ({ ...prev, unreadMessages: prev.unreadMessages + 1 }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'direct_messages',
          filter: `recipient_id=eq.${currentUser.id}`
        },
        () => {
          // Refetch to get accurate count after messages are marked as read
          fetchUnreadCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, fetchUnreadCounts]);

  // Real-time subscription for chat messages
  useEffect(() => {
    if (!currentUser?.id || !eventId) return;

    const channel = supabase
      .channel('unread-counts-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `event_id=eq.${eventId}`
        },
        (payload) => {
          // Only increment if message is from someone else
          if (payload.new && (payload.new as any).user_id !== currentUser.id) {
            setCounts(prev => ({ ...prev, unreadChats: prev.unreadChats + 1 }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, eventId]);

  return {
    unreadMessages: counts.unreadMessages,
    unreadChats: counts.unreadChats,
    loading,
    refetch: fetchUnreadCounts,
    markChatAsSeen
  };
};

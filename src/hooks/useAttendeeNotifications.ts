import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export interface AttendeeNotification {
  id: string;
  type: 'direct_message' | 'group_chat' | 'connection' | 'general';
  title: string;
  message: string;
  user_id: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

export const useAttendeeNotifications = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<AttendeeNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      setupRealtimeSubscriptions();
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications((data || []) as AttendeeNotification[]);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error fetching attendee notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    if (!currentUser?.id) return;

    // Notifications subscription
    const notificationsChannel = supabase
      .channel('attendee-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUser.id}`
        },
        (payload) => {
          const newNotification = payload.new as AttendeeNotification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast for new notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    // Direct messages subscription
    const directMessagesChannel = supabase
      .channel('attendee-direct-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `recipient_id=eq.${currentUser.id}`
        },
        async (payload) => {
          const newMessage = payload.new;
          
          // Get sender profile
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', newMessage.sender_id)
            .single();

          // Create notification for direct message
          const notification: AttendeeNotification = {
            id: `dm-${newMessage.id}`,
            type: 'direct_message',
            title: 'New Direct Message',
            message: `${senderProfile?.name || 'Someone'} sent you a message`,
            user_id: currentUser.id,
            related_id: newMessage.id,
            is_read: false,
            created_at: newMessage.created_at
          };

          setNotifications(prev => [notification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          toast({
            title: notification.title,
            description: notification.message,
          });
        }
      )
      .subscribe();

    // Chat messages subscription (group chat)
    const chatChannel = supabase
      .channel('attendee-chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        async (payload) => {
          const newMessage = payload.new;
          
          // Only notify if it's not my own message
          if (newMessage.user_id !== currentUser.id) {
            // Get sender profile
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', newMessage.user_id)
              .single();

            // Create notification for group chat message
            const notification: AttendeeNotification = {
              id: `chat-${newMessage.id}`,
              type: 'group_chat',
              title: 'New Group Message',
              message: `${senderProfile?.name || 'Someone'} posted in group chat`,
              user_id: currentUser.id,
              related_id: newMessage.id,
              is_read: false,
              created_at: newMessage.created_at
            };

            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            toast({
              title: notification.title,
              description: notification.message,
            });
          }
        }
      )
      .subscribe();

    // Connection requests subscription
    const connectionsChannel = supabase
      .channel('attendee-connections')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'connections',
          filter: `recipient_id=eq.${currentUser.id}`
        },
        async (payload) => {
          const newConnection = payload.new;
          
          // Get requester profile
          const { data: requesterProfile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', newConnection.requester_id)
            .single();

          // Create notification for connection request
          const notification: AttendeeNotification = {
            id: `conn-${newConnection.id}`,
            type: 'connection',
            title: 'New Connection Request',
            message: `${requesterProfile?.name || 'Someone'} wants to connect with you`,
            user_id: currentUser.id,
            related_id: newConnection.id,
            is_read: false,
            created_at: newConnection.created_at
          };

          setNotifications(prev => [notification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          toast({
            title: notification.title,
            description: notification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(directMessagesChannel);
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(connectionsChannel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // For real notifications
      if (!notificationId.includes('-')) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId);
      }

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mark real notifications as read
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', currentUser?.id)
        .eq('is_read', false);

      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendeeNotifications } from './useAttendeeNotifications';

export const useNotificationCount = () => {
  const { currentUser } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Use the comprehensive attendee notifications hook if user is an attendee
  const attendeeNotifications = useAttendeeNotifications();

  useEffect(() => {
    if (currentUser && attendeeNotifications) {
      // Always use attendee notifications system for better state management
      const newUnreadCount = attendeeNotifications.getUnreadCount();
      setUnreadCount(newUnreadCount);
    }
  }, [currentUser, attendeeNotifications, attendeeNotifications.notifications]);

  // Set up additional real-time subscription for immediate updates
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('notifications-count-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUser.id}`
        },
        () => {
          // Force a re-calculation of unread count
          const newUnreadCount = attendeeNotifications.getUnreadCount();
          setUnreadCount(newUnreadCount);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, attendeeNotifications]);

  return { 
    unreadCount, 
    refetch: attendeeNotifications.refetch 
  };
};


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

export const useAdminNotifications = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['admin-notifications', currentUser?.id],
    queryFn: async (): Promise<AdminNotification[]> => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching notifications for admin:', currentUser.id);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      console.log('Fetched notifications:', data);
      return data || [];
    },
    enabled: !!currentUser?.id,
  });

  // Set up real-time subscription for notifications
  useEffect(() => {
    if (!currentUser?.id) return;

    console.log('Setting up real-time subscription for notifications');

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUser.id}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
          
          // Show toast for new notification
          const newNotification = payload.new as AdminNotification;
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUser.id}`
        },
        () => {
          console.log('Notification updated');
          queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up notifications subscription');
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, queryClient, toast]);

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      console.log('Marking notification as read:', notificationId);
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
    onError: (error: any) => {
      console.error('Error updating notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification',
        variant: 'destructive',
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      console.log('Marking all notifications as read for user:', currentUser?.id);
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', currentUser?.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    },
    onError: (error: any) => {
      console.error('Error updating notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notifications',
        variant: 'destructive',
      });
    },
  });

  return {
    notifications,
    isLoading,
    error,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingRead: markAsReadMutation.isPending,
    isMarkingAllRead: markAllAsReadMutation.isPending,
  };
};

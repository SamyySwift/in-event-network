
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ConnectionNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  related_id: string;
  is_read: boolean;
  created_at: string;
  connection?: {
    id: string;
    requester_id: string;
    recipient_id: string;
    status: string;
    requester_profile?: {
      name: string;
      photo_url: string | null;
      role: string | null;
      company: string | null;
    };
  };
}

export const useConnectionRequests = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<ConnectionNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchConnectionRequests();
    }
  }, [currentUser]);

  const fetchConnectionRequests = async () => {
    try {
      console.log('Fetching connection requests for user:', currentUser?.id);
      
      // First get notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUser?.id)
        .eq('type', 'connection')
        .order('created_at', { ascending: false });

      if (notificationsError) {
        console.error('Error fetching notifications:', notificationsError);
        throw notificationsError;
      }

      console.log('Notifications data:', notificationsData);

      // Remove duplicates based on related_id (connection_id)
      const uniqueNotifications = notificationsData?.filter((notification, index, self) => 
        index === self.findIndex(n => n.related_id === notification.related_id)
      ) || [];

      console.log('Unique notifications:', uniqueNotifications);

      // Then get connection details for each unique notification
      const notificationsWithConnections = await Promise.all(
        uniqueNotifications.map(async (notification) => {
          if (notification.related_id) {
            const { data: connectionData, error: connectionError } = await supabase
              .from('connections')
              .select(`
                id,
                requester_id,
                recipient_id,
                status,
                requester_profile:profiles!connections_requester_id_fkey (
                  name,
                  photo_url,
                  role,
                  company
                )
              `)
              .eq('id', notification.related_id)
              .single();

            if (connectionError) {
              console.error('Error fetching connection:', connectionError);
              return {
                ...notification,
                connection: undefined
              };
            }

            return {
              ...notification,
              connection: connectionData
            };
          }
          
          return {
            ...notification,
            connection: undefined
          };
        })
      );

      console.log('Final notifications with connections:', notificationsWithConnections);
      setNotifications(notificationsWithConnections);
    } catch (error) {
      console.error('Error fetching connection requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch connection requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const acceptConnectionRequest = async (connectionId: string, notificationId: string) => {
    try {
      // Update connection status
      const { error: connectionError } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);

      if (connectionError) throw connectionError;

      // Mark notification as read
      const { error: notificationError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (notificationError) throw notificationError;

      toast({
        title: "Connection Accepted",
        description: "You are now connected!",
      });

      // Refresh notifications
      fetchConnectionRequests();
    } catch (error) {
      console.error('Error accepting connection:', error);
      toast({
        title: "Error",
        description: "Failed to accept connection request",
        variant: "destructive",
      });
    }
  };

  const declineConnectionRequest = async (connectionId: string, notificationId: string) => {
    try {
      // Update connection status
      const { error: connectionError } = await supabase
        .from('connections')
        .update({ status: 'rejected' })
        .eq('id', connectionId);

      if (connectionError) throw connectionError;

      // Mark notification as read
      const { error: notificationError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (notificationError) throw notificationError;

      toast({
        title: "Connection Declined",
        description: "Connection request has been declined",
      });

      // Refresh notifications
      fetchConnectionRequests();
    } catch (error) {
      console.error('Error declining connection:', error);
      toast({
        title: "Error",
        description: "Failed to decline connection request",
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return {
    notifications,
    loading,
    acceptConnectionRequest,
    declineConnectionRequest,
    markAsRead,
    refetch: fetchConnectionRequests,
  };
};

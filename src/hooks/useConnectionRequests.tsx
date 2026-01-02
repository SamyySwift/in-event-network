import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getCache, setCache } from '@/utils/queryCache';

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

const CACHE_KEY = 'connection-requests';

export const useConnectionRequests = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<ConnectionNotification[]>(() => {
    // Load from cache immediately for instant render
    if (currentUser?.id) {
      return getCache<ConnectionNotification[]>(`${CACHE_KEY}-${currentUser.id}`) ?? [];
    }
    return [];
  });
  const [loading, setLoading] = useState(true);

  const fetchConnectionRequests = useCallback(async () => {
    if (!currentUser?.id) return;

    try {
      // First get notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('type', 'connection')
        .order('created_at', { ascending: false })
        .limit(50); // Limit to prevent large payloads

      if (notificationsError) throw notificationsError;

      // Remove duplicates based on related_id
      const uniqueNotifications = notificationsData?.filter((notification, index, self) =>
        index === self.findIndex(n => n.related_id === notification.related_id)
      ) || [];

      if (uniqueNotifications.length === 0) {
        setNotifications([]);
        setCache(`${CACHE_KEY}-${currentUser.id}`, []);
        return;
      }

      // Get all connection IDs
      const connectionIds = uniqueNotifications
        .map(n => n.related_id)
        .filter(Boolean) as string[];

      if (connectionIds.length === 0) {
        const result = uniqueNotifications.map(n => ({ ...n, connection: undefined }));
        setNotifications(result);
        setCache(`${CACHE_KEY}-${currentUser.id}`, result);
        return;
      }

      // BATCH FETCH: Get all connections in ONE query instead of N queries
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select(`
          id,
          requester_id,
          recipient_id,
          status
        `)
        .in('id', connectionIds);

      if (connectionsError) {
        console.error('Error fetching connections:', connectionsError);
      }

      // Get unique requester IDs
      const requesterIds = [...new Set((connectionsData || []).map(c => c.requester_id).filter(Boolean))];

      // BATCH FETCH: Get all requester profiles in ONE query
      let profilesMap: Record<string, any> = {};
      if (requesterIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('public_profiles')
          .select('id, name, photo_url, role, company')
          .in('id', requesterIds);

        if (!profilesError && profilesData) {
          profilesMap = Object.fromEntries(profilesData.map(p => [p.id, p]));
        }
      }

      // Build connections map
      const connectionsMap: Record<string, any> = {};
      (connectionsData || []).forEach(conn => {
        connectionsMap[conn.id] = {
          ...conn,
          requester_profile: profilesMap[conn.requester_id] || undefined,
        };
      });

      // Map notifications with connections
      const notificationsWithConnections: ConnectionNotification[] = uniqueNotifications.map(notification => ({
        ...notification,
        connection: notification.related_id ? connectionsMap[notification.related_id] : undefined,
      }));

      setNotifications(notificationsWithConnections);
      setCache(`${CACHE_KEY}-${currentUser.id}`, notificationsWithConnections);
    } catch (error) {
      console.error('Error fetching connection requests:', error);
      // Don't show toast on every error - just log it
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser?.id) {
      // Load cache first for instant render
      const cached = getCache<ConnectionNotification[]>(`${CACHE_KEY}-${currentUser.id}`);
      if (cached && cached.length > 0) {
        setNotifications(cached);
        setLoading(false);
      }
      // Then fetch fresh data in background
      fetchConnectionRequests();
    }
  }, [currentUser?.id, fetchConnectionRequests]);

  const acceptConnectionRequest = async (connectionId: string, notificationId: string) => {
    try {
      const { error: connectionError } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);

      if (connectionError) throw connectionError;

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      toast({
        title: "Connection Accepted",
        description: "You are now connected!",
      });

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
      const { error: connectionError } = await supabase
        .from('connections')
        .update({ status: 'rejected' })
        .eq('id', connectionId);

      if (connectionError) throw connectionError;

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      toast({
        title: "Connection Declined",
        description: "Connection request has been declined",
      });

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

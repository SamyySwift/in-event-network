import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendeeEventContext } from '@/contexts/AttendeeEventContext';

export type UserStatus = 'online' | 'away' | 'offline';

interface UserPresence {
  user_id: string;
  status: UserStatus;
  last_seen: string;
  current_route?: string;
}

export const useUserPresence = () => {
  const { currentUser } = useAuth();
  const { currentEventId } = useAttendeeEventContext();
  const [presences, setPresences] = useState<Record<string, UserPresence>>({});
  const channelRef = useRef<any>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  // Track current route for better presence detection
  const [currentRoute, setCurrentRoute] = useState<string>('');

  useEffect(() => {
    setCurrentRoute(window.location.pathname);
    
    const handleRouteChange = () => {
      setCurrentRoute(window.location.pathname);
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    // Override pushState and replaceState to catch programmatic navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      handleRouteChange();
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      handleRouteChange();
    };

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  useEffect(() => {
    if (!currentUser?.id || !currentEventId) return;

    const channelName = `event_${currentEventId}_presence`;
    
    // Create channel
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    // Track presence state
    const userPresence: UserPresence = {
      user_id: currentUser.id,
      status: 'online',
      last_seen: new Date().toISOString(),
      current_route: currentRoute,
    };

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const newPresences: Record<string, UserPresence> = {};
        
        Object.entries(presenceState).forEach(([userId, presenceArray]) => {
          if (Array.isArray(presenceArray) && presenceArray.length > 0) {
            const presence = presenceArray[0] as any;
            if (presence && presence.user_id) {
              newPresences[presence.user_id] = presence as UserPresence;
            }
          }
        });
        
        setPresences(newPresences);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        newPresences.forEach((presence: any) => {
          if (presence && presence.user_id) {
            setPresences(prev => ({
              ...prev,
              [presence.user_id]: presence as UserPresence
            }));
          }
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        leftPresences.forEach((presence: any) => {
          if (presence && presence.user_id) {
            setPresences(prev => {
              const updated = { ...prev };
              delete updated[presence.user_id];
              return updated;
            });
          }
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track(userPresence);
        }
      });

    // Update presence when route changes
    const updatePresence = () => {
      if (channelRef.current && currentUser?.id) {
        const isDashboard = currentRoute.includes('/attendee');
        channelRef.current.track({
          user_id: currentUser.id,
          status: isDashboard ? 'online' : 'away',
          last_seen: new Date().toISOString(),
          current_route: currentRoute,
        });
      }
    };

    updatePresence();

    // Set up heartbeat to update presence every 30 seconds
    heartbeatRef.current = setInterval(() => {
      updatePresence();
    }, 30000);

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched tabs or minimized window
        channelRef.current?.track({
          user_id: currentUser.id,
          status: 'away',
          last_seen: new Date().toISOString(),
          current_route: currentRoute,
        });
      } else {
        // User came back
        const isDashboard = currentRoute.includes('/attendee');
        channelRef.current?.track({
          user_id: currentUser.id,
          status: isDashboard ? 'online' : 'away',
          last_seen: new Date().toISOString(),
          current_route: currentRoute,
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [currentUser?.id, currentEventId, currentRoute]);

  const getUserStatus = (userId: string): UserStatus => {
    const presence = presences[userId];
    if (!presence) return 'offline';
    
    const lastSeen = new Date(presence.last_seen);
    const now = new Date();
    const diffInMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
    
    // If last seen is more than 2 minutes ago, consider offline
    if (diffInMinutes > 2) return 'offline';
    
    return presence.status;
  };

  const getStatusColor = (status: UserStatus): string => {
    switch (status) {
      case 'online':
        return 'bg-green-400';
      case 'away':
        return 'bg-orange-400';
      case 'offline':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  };

  return {
    getUserStatus,
    getStatusColor,
    presences,
  };
};
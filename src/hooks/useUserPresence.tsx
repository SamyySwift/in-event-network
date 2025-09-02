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
      const newRoute = window.location.pathname;
      setCurrentRoute(newRoute);
      
      // Force presence update immediately on route change
      setTimeout(() => {
        if (channelRef.current && currentUser?.id) {
          const isInAttendeeDashboard = newRoute.includes('/attendee');
          const isInAdminDashboard = newRoute.includes('/admin');
          const isInHostDashboard = newRoute.includes('/host');
          const isInApp = isInAttendeeDashboard || isInAdminDashboard || isInHostDashboard;
          
          channelRef.current.track({
            user_id: currentUser.id,
            status: isInApp ? 'online' : 'away',
            last_seen: new Date().toISOString(),
            current_route: newRoute,
          });
        }
      }, 100); // Small delay to ensure channel is ready
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
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser?.id || !currentEventId) return;

    console.log('[UserPresence] Setting up presence for user:', currentUser.id, 'event:', currentEventId, 'route:', currentRoute);

    const channelName = `event_${currentEventId}_presence`;
    
    // Create channel
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    // Determine initial status
    const isInAttendeeDashboard = currentRoute.includes('/attendee');
    const isInAdminDashboard = currentRoute.includes('/admin');
    const isInHostDashboard = currentRoute.includes('/host');
    const isInApp = isInAttendeeDashboard || isInAdminDashboard || isInHostDashboard;

    console.log('[UserPresence] Initial status check:', {
      currentRoute,
      isInAttendeeDashboard,
      isInApp,
      status: isInApp ? 'online' : 'away'
    });

    // Track presence state
    const userPresence: UserPresence = {
      user_id: currentUser.id,
      status: isInApp ? 'online' : 'away',
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
        
        console.log('[UserPresence] Synced presences:', newPresences);
        setPresences(newPresences);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('[UserPresence] Users joined:', newPresences);
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
        console.log('[UserPresence] Users left:', leftPresences);
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
        console.log('[UserPresence] Channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('[UserPresence] Tracking initial presence:', userPresence);
          await channel.track(userPresence);
        }
      });

    // Update presence when route changes
    const updatePresence = () => {
      if (channelRef.current && currentUser?.id) {
        // Always show green when in attendee dashboard (any attendee page)
        const isInAttendeeDashboard = currentRoute.includes('/attendee');
        const isInAdminDashboard = currentRoute.includes('/admin');
        const isInHostDashboard = currentRoute.includes('/host');
        const isInApp = isInAttendeeDashboard || isInAdminDashboard || isInHostDashboard;
        
        const newPresence = {
          user_id: currentUser.id,
          status: isInApp ? 'online' : 'away',
          last_seen: new Date().toISOString(),
          current_route: currentRoute,
        };

        console.log('[UserPresence] Updating presence:', newPresence);
        channelRef.current.track(newPresence);
      }
    };

    updatePresence();

    // Set up heartbeat to update presence every 15 seconds (more frequent)
    heartbeatRef.current = setInterval(() => {
      updatePresence();
    }, 15000);

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched tabs or minimized window - they're away from the app
        const awayPresence = {
          user_id: currentUser.id,
          status: 'away' as UserStatus,
          last_seen: new Date().toISOString(),
          current_route: currentRoute,
        };
        console.log('[UserPresence] User went away (tab hidden):', awayPresence);
        channelRef.current?.track(awayPresence);
      } else {
        // User came back - check if they're in the app
        const isInAttendeeDashboard = currentRoute.includes('/attendee');
        const isInAdminDashboard = currentRoute.includes('/admin');
        const isInHostDashboard = currentRoute.includes('/host');
        const isInApp = isInAttendeeDashboard || isInAdminDashboard || isInHostDashboard;
        
        const backPresence = {
          user_id: currentUser.id,
          status: isInApp ? 'online' as UserStatus : 'away' as UserStatus,
          last_seen: new Date().toISOString(),
          current_route: currentRoute,
        };
        console.log('[UserPresence] User came back (tab visible):', backPresence);
        channelRef.current?.track(backPresence);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      console.log('[UserPresence] Cleaning up presence tracking');
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
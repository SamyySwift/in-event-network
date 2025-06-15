
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

interface DashboardData {
  currentEvent: any;
  upcomingEvents: any[];
  nextSession: any;
  recentAnnouncements: any[];
  suggestedConnections: any[];
}

export const useDashboard = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard', currentUser?.id],
    queryFn: async (): Promise<DashboardData> => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      const now = new Date().toISOString();

      // Get the user's current event from their profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('current_event_id')
        .eq('id', currentUser.id)
        .single();

      if (!userProfile?.current_event_id) {
        // If user has no current event, return empty data
        return {
          currentEvent: null,
          upcomingEvents: [],
          nextSession: null,
          recentAnnouncements: [],
          suggestedConnections: [],
        };
      }

      // Get the current event details
      const { data: currentEventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', userProfile.current_event_id)
        .single();

      if (!currentEventData) {
        return {
          currentEvent: null,
          upcomingEvents: [],
          nextSession: null,
          recentAnnouncements: [],
          suggestedConnections: [],
        };
      }

      const hostId = currentEventData.host_id;

      // Check if current event is live
      const isCurrentEventLive = currentEventData.start_time <= now && currentEventData.end_time >= now;
      const currentEvent = isCurrentEventLive ? currentEventData : null;

      // Get upcoming events from the same host only
      const { data: upcomingEvents } = await supabase
        .from('events')
        .select('*')
        .eq('host_id', hostId)
        .gt('start_time', now)
        .order('start_time', { ascending: true })
        .limit(5);

      // Get recent announcements for events from this host only
      const { data: hostEvents } = await supabase
        .from('events')
        .select('id')
        .eq('host_id', hostId);

      const eventIds = hostEvents?.map(e => e.id) || [];

      const { data: announcements } = await supabase
        .from('announcements')
        .select('*')
        .in('event_id', eventIds)
        .order('created_at', { ascending: false })
        .limit(3);

      // Get speakers for upcoming sessions from this host's events only
      const { data: speakers } = await supabase
        .from('speakers')
        .select('*')
        .in('event_id', eventIds)
        .not('session_time', 'is', null)
        .gt('session_time', now)
        .order('session_time', { ascending: true })
        .limit(1);

      // Get suggested connections from attendees of the same host's events
      const { data: sameHostAttendees } = await supabase
        .from('event_participants')
        .select(`
          user_id,
          profiles:user_id (
            id,
            name,
            role,
            company,
            bio,
            niche,
            photo_url,
            networking_preferences,
            tags,
            twitter_link,
            linkedin_link,
            github_link,
            instagram_link,
            website_link,
            created_at
          )
        `)
        .in('event_id', eventIds)
        .neq('user_id', currentUser.id)
        .limit(6);

      const suggestedConnections = sameHostAttendees?.map((participant: any) => participant.profiles).filter(Boolean) || [];

      return {
        currentEvent,
        upcomingEvents: upcomingEvents || [],
        nextSession: speakers?.[0] || null,
        recentAnnouncements: announcements || [],
        suggestedConnections: suggestedConnections.slice(0, 3),
      };
    },
    enabled: !!currentUser,
    // Remove refetchInterval: live updates now handled with realtime
  });

  // Add realtime effect
  useEffect(() => {
    if (!currentUser?.id) return;

    // Listen for realtime changes on attendee dashboard-relevant tables
    // Listen to events, announcements, speakers, event_participants
    const tables = [
      'events',
      'announcements',
      'speakers',
      'event_participants'
    ];

    const channels = tables.map((table) => 
      supabase.channel(`realtime:attendee-dash:${table}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
          },
          (payload) => {
            // Broad invalidate so re-query picks up all changes
            queryClient.invalidateQueries({ queryKey: ['dashboard', currentUser.id] });
          }
        )
        .subscribe()
    );

    return () => {
      // Unsubscribe when user changes or unmounts
      channels.forEach(channel => {
        try { supabase.removeChannel(channel); } catch {}
      });
    };
  }, [currentUser?.id, queryClient]);

  return {
    dashboardData,
    isLoading,
    error,
  };
};

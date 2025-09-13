
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

interface DashboardData {
  currentEvent: any;
  upcomingEvents: any[];
  nextSession: any;
  upcomingSessions: any[];
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
          upcomingSessions: [],
          recentAnnouncements: [],
          suggestedConnections: [],
        };
      }

      // Use Promise.all to run parallel queries for better performance
      const [
        currentEventResponse,
        upcomingEventsResponse,
        announcementsResponse,
        speakersResponse,
        upcomingSessionsResponse,
        suggestedConnectionsResponse
      ] = await Promise.all([
        // Get current event details
        supabase
          .from('events')
          .select('*')
          .eq('id', userProfile.current_event_id)
          .single(),
        
        // Get upcoming events from the same host
        supabase
          .from('events')
          .select('*, profiles!events_host_id_fkey(id)')
          .eq('id', userProfile.current_event_id)
          .single()
          .then(async ({ data: eventData }) => {
            if (!eventData?.host_id) return { data: [] };
            return supabase
              .from('events')
              .select('*')
              .eq('host_id', eventData.host_id)
              .gt('start_time', now)
              .order('start_time', { ascending: true })
              .limit(3);
          }),

        // Get recent announcements for current event
        supabase
          .from('announcements')
          .select('*')
          .eq('event_id', userProfile.current_event_id)
          .order('created_at', { ascending: false })
          .limit(3),

        // Get next speaker session
        supabase
          .from('speakers')
          .select('*')
          .eq('event_id', userProfile.current_event_id)
          .not('session_time', 'is', null)
          .gt('session_time', now)
          .order('session_time', { ascending: true })
          .limit(1),

        // Get upcoming schedule items
        supabase
          .from('schedule_items')
          .select('*')
          .eq('event_id', userProfile.current_event_id)
          .gt('start_time', now)
          .order('start_time', { ascending: true })
          .limit(3),

        // Get suggested connections from same event
        supabase
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
              linkedin_link
            )
          `)
          .eq('event_id', userProfile.current_event_id)
          .neq('user_id', currentUser.id)
          .limit(3)
      ]);

      const currentEventData = currentEventResponse.data;
      const isCurrentEventLive = currentEventData && 
        currentEventData.start_time <= now && 
        currentEventData.end_time >= now;

      const suggestedConnections = suggestedConnectionsResponse.data
        ?.map((participant: any) => participant.profiles)
        .filter(Boolean) || [];

      return {
        currentEvent: isCurrentEventLive ? currentEventData : null,
        upcomingEvents: upcomingEventsResponse.data || [],
        nextSession: speakersResponse.data?.[0] || null,
        upcomingSessions: upcomingSessionsResponse.data || [],
        recentAnnouncements: announcementsResponse.data || [],
        suggestedConnections: suggestedConnections.slice(0, 3),
      };
    },
    enabled: !!currentUser,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  // Add realtime effect
  useEffect(() => {
    if (!currentUser?.id) return;

    // Listen for realtime changes on attendee dashboard-relevant tables
    // Listen to events, announcements, speakers, event_participants, schedule_items
    const tables = [
      'events',
      'announcements',
      'speakers',
      'event_participants',
      'schedule_items'
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

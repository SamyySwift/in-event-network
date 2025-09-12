
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
  const { useAttendeeEventContext } = require('@/contexts/AttendeeEventContext');
  const { currentEventId } = useAttendeeEventContext();

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard', currentUser?.id, currentEventId],
    queryFn: async (): Promise<DashboardData> => {
      if (!currentUser?.id || !currentEventId) {
        return {
          currentEvent: null,
          upcomingEvents: [],
          nextSession: null,
          upcomingSessions: [],
          recentAnnouncements: [],
          suggestedConnections: [],
        };
      }

      const now = new Date().toISOString();

      // Use Promise.all scoped strictly to currentEventId
      const [
        currentEventResponse,
        upcomingEventsResponse,
        announcementsResponse,
        speakersResponse,
        upcomingSessionsResponse,
        suggestedConnectionsResponse
      ] = await Promise.all([
        supabase
          .from('events')
          .select('*')
          .eq('id', currentEventId)
          .single(),

        // If you still want to show upcoming events from the same host, you may keep this; otherwise, return []
        // Here we keep it but compute host via the current event id only
        supabase
          .from('events')
          .select('*, profiles!events_host_id_fkey(id)')
          .eq('id', currentEventId)
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

        supabase
          .from('announcements')
          .select('*')
          .eq('event_id', currentEventId)
          .order('created_at', { ascending: false })
          .limit(3),

        supabase
          .from('speakers')
          .select('*')
          .eq('event_id', currentEventId)
          .not('session_time', 'is', null)
          .gt('session_time', now)
          .order('session_time', { ascending: true })
          .limit(1),

        supabase
          .from('schedule_items')
          .select('*')
          .eq('event_id', currentEventId)
          .gt('start_time', now)
          .order('start_time', { ascending: true })
          .limit(3),

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
          .eq('event_id', currentEventId)
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
    enabled: !!currentUser && !!currentEventId,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });

  // Add realtime effect
  useEffect(() => {
    if (!currentUser?.id || !currentEventId) return;
    const tables = ['events','announcements','speakers','event_participants','schedule_items'];

    const channels = tables.map((table) => 
      supabase.channel(`realtime:attendee-dash:${table}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard', currentUser.id, currentEventId] });
          }
        )
        .subscribe()
    );
    return () => { channels.forEach((channel) => { try { supabase.removeChannel(channel); } catch {} }); };
  }, [currentUser?.id, currentEventId, queryClient]);

  return { dashboardData, isLoading, error };
};

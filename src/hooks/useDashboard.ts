
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardData {
  currentEvent: any;
  upcomingEvents: any[];
  nextSession: any;
  recentAnnouncements: any[];
  suggestedConnections: any[];
}

export const useDashboard = () => {
  const { currentUser } = useAuth();

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['attendeeDashboard', currentUser?.id, currentUser?.current_event_id],
    queryFn: async (): Promise<DashboardData> => {
      if (!currentUser || currentUser.role !== 'attendee') {
        throw new Error('Only attendees can access this dashboard');
      }

      // Get the events the attendee has joined
      const { data: participantData, error: participantError } = await supabase
        .from('event_participants')
        .select(`
          event_id,
          events!inner (
            id,
            name,
            description,
            start_time,
            end_time,
            location,
            banner_url,
            host_id
          )
        `)
        .eq('user_id', currentUser.id);

      if (participantError) {
        console.error('Error fetching participant events:', participantError);
        throw participantError;
      }

      const events = participantData?.map(p => p.events).filter(Boolean) || [];
      const eventIds = events.map(e => e.id);
      const hostIds = events.map(e => e.host_id).filter(Boolean);

      if (eventIds.length === 0) {
        return {
          currentEvent: null,
          upcomingEvents: [],
          nextSession: null,
          recentAnnouncements: [],
          suggestedConnections: []
        };
      }

      // Determine current and upcoming events
      const now = new Date();
      const currentEvent = events.find(event => {
        const startTime = new Date(event.start_time);
        const endTime = new Date(event.end_time);
        return startTime <= now && endTime >= now;
      }) || null;

      const upcomingEvents = events.filter(event => {
        const startTime = new Date(event.start_time);
        return startTime > now;
      }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

      // Get next speaker session from attendee's events only
      const { data: speakers } = await supabase
        .from('speakers')
        .select('*')
        .in('event_id', eventIds)
        .not('session_time', 'is', null)
        .gte('session_time', now.toISOString())
        .order('session_time', { ascending: true })
        .limit(1);

      const nextSession = speakers?.[0] || null;

      // Get recent announcements from attendee's events only
      const { data: announcements } = await supabase
        .from('announcements')
        .select('*')
        .in('event_id', eventIds)
        .order('created_at', { ascending: false })
        .limit(3);

      const recentAnnouncements = announcements || [];

      // Get suggested connections from the same events
      const { data: otherParticipants } = await supabase
        .from('event_participants')
        .select(`
          user_id,
          profiles!inner (
            id,
            name,
            photo_url,
            niche,
            company
          )
        `)
        .in('event_id', eventIds)
        .neq('user_id', currentUser.id)
        .limit(6);

      const suggestedConnections = otherParticipants?.map(p => p.profiles).filter(Boolean) || [];

      return {
        currentEvent,
        upcomingEvents,
        nextSession,
        recentAnnouncements,
        suggestedConnections
      };
    },
    enabled: !!currentUser && currentUser.role === 'attendee',
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
  });

  return {
    dashboardData,
    isLoading,
    error,
  };
};

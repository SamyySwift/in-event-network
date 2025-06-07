
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
    queryKey: ['attendeeDashboard', currentUser?.id],
    queryFn: async (): Promise<DashboardData> => {
      if (!currentUser || currentUser.role !== 'attendee') {
        throw new Error('Only attendees can access this dashboard');
      }

      // First, get the current user's profile to find their current event
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('current_event_id')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      if (!profile?.current_event_id) {
        return {
          currentEvent: null,
          upcomingEvents: [],
          nextSession: null,
          recentAnnouncements: [],
          suggestedConnections: []
        };
      }

      // Get the specific event details
      const { data: currentEvent, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', profile.current_event_id)
        .single();

      if (eventError) {
        console.error('Error fetching current event:', eventError);
        throw eventError;
      }

      if (!currentEvent) {
        return {
          currentEvent: null,
          upcomingEvents: [],
          nextSession: null,
          recentAnnouncements: [],
          suggestedConnections: []
        };
      }

      // Get all events from the same host (admin)
      const { data: hostEvents, error: hostEventsError } = await supabase
        .from('events')
        .select('*')
        .eq('host_id', currentEvent.host_id);

      if (hostEventsError) {
        console.error('Error fetching host events:', hostEventsError);
        throw hostEventsError;
      }

      const events = hostEvents || [];
      const eventIds = events.map(e => e.id);

      // Determine current and upcoming events from this host only
      const now = new Date();
      const liveEvent = events.find(event => {
        if (!event?.start_time || !event?.end_time) return false;
        const startTime = new Date(event.start_time);
        const endTime = new Date(event.end_time);
        return startTime <= now && endTime >= now;
      }) || null;

      const upcomingEvents = events.filter(event => {
        if (!event?.start_time) return false;
        const startTime = new Date(event.start_time);
        return startTime > now;
      }).sort((a, b) => {
        if (!a?.start_time || !b?.start_time) return 0;
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
      });

      // Get next speaker session from this host's events only
      const { data: speakers } = await supabase
        .from('speakers')
        .select('*')
        .in('event_id', eventIds)
        .not('session_time', 'is', null)
        .gte('session_time', now.toISOString())
        .order('session_time', { ascending: true })
        .limit(1);

      const nextSession = speakers?.[0] || null;

      // Get recent announcements from this host's events only
      const { data: announcements } = await supabase
        .from('announcements')
        .select('*')
        .in('event_id', eventIds)
        .order('created_at', { ascending: false })
        .limit(3);

      const recentAnnouncements = announcements || [];

      // Get suggested connections only from attendees of the current specific event
      const { data: currentEventParticipants } = await supabase
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
        .eq('event_id', profile.current_event_id)
        .neq('user_id', currentUser.id)
        .limit(6);

      const suggestedConnections = currentEventParticipants?.map(p => p.profiles).filter(Boolean) || [];

      return {
        currentEvent: liveEvent,
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

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardData {
  eventsCount: number;
  attendeesCount: number;
  speakersCount: number;
  questionsCount: number;
  liveEventsCount: number;
  upcomingEventsCount: number;
  connectionsCount: number;
  performanceScore: number;
}

export const useAdminDashboard = () => {
  const { currentUser } = useAuth();

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard', currentUser?.id],
    queryFn: async (): Promise<DashboardData> => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching dashboard data for admin:', currentUser.id);

      const now = new Date().toISOString();

      // Get only events hosted by the current admin
      const { count: eventsCount, error: eventsError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('host_id', currentUser.id);

      if (eventsError) {
        console.error('Error fetching events count:', eventsError);
        throw eventsError;
      }

      // Get admin's events for other calculations
      const { data: events, error: eventsDataError } = await supabase
        .from('events')
        .select('id, start_time, end_time')
        .eq('host_id', currentUser.id);

      if (eventsDataError) {
        console.error('Error fetching events data:', eventsDataError);
        throw eventsDataError;
      }

      const eventIds = events?.map(e => e.id) || [];

      // Calculate live and upcoming events
      const liveEvents = events?.filter(event => {
        const start = new Date(event.start_time);
        const end = new Date(event.end_time);
        const current = new Date(now);
        return current >= start && current <= end;
      }) || [];

      const upcomingEvents = events?.filter(event => {
        const start = new Date(event.start_time);
        const current = new Date(now);
        return current < start;
      }) || [];

      // Get counts only for the current admin's events
      const [attendeesResult, speakersResult, questionsResult, eventParticipantsResult] = await Promise.all([
        eventIds.length > 0 ? supabase
          .from('event_participants')
          .select('*', { count: 'exact', head: true })
          .in('event_id', eventIds) : { count: 0, error: null },
        
        eventIds.length > 0 ? supabase
          .from('speakers')
          .select('*', { count: 'exact', head: true })
          .in('event_id', eventIds) : { count: 0, error: null },
        
        eventIds.length > 0 ? supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .in('event_id', eventIds) : { count: 0, error: null },

        eventIds.length > 0 ? supabase
          .from('event_participants')
          .select('user_id')
          .in('event_id', eventIds) : { data: [], error: null }
      ]);

      if (attendeesResult.error) {
        console.error('Error fetching attendees:', attendeesResult.error);
      }
      if (speakersResult.error) {
        console.error('Error fetching speakers:', speakersResult.error);
      }
      if (questionsResult.error) {
        console.error('Error fetching questions:', questionsResult.error);
      }
      if (eventParticipantsResult.error) {
        console.error('Error fetching participant user IDs:', eventParticipantsResult.error);
      }

      // Get unique attendee user ids for admin events
      const attendeeUserIds: string[] = (eventParticipantsResult?.data || [])
        .map((p: any) => p.user_id)
        .filter(Boolean);
      const uniqueAttendeeUserIds = Array.from(new Set(attendeeUserIds));

      // DEBUG: log attendee user IDs used for connections
      console.log('[DASHBOARD-CONNECTIONS]', { uniqueAttendeeUserIds });

      // Get all accepted connections between these attendees (either direction)
      let connectionsCount = 0;
      if (uniqueAttendeeUserIds.length > 0) {
        // Supabase requires the .or() argument to be a string in this exact format:
        // "requester_id.in.(uuid1,uuid2),recipient_id.in.(uuid1,uuid2)"
        const inList = uniqueAttendeeUserIds.map(id => `"${id}"`).join(',');
        const orFilter = `requester_id.in.(${inList}),recipient_id.in.(${inList})`;
        // DEBUG: log the orFilter used
        console.log('[DASHBOARD-CONNECTIONS] Query .or() filter:', orFilter);

        const { count: connectionsCountRes, error: connectionsError } = await supabase
          .from('connections')
          .select('*', { count: 'exact', head: true })
          .or(orFilter)
          .eq('status', 'accepted');
        if (connectionsError) {
          console.error('Error fetching attendee connections:', connectionsError);
        }
        connectionsCount = connectionsCountRes || 0;
        // DEBUG: log the result from the query
        console.log('[DASHBOARD-CONNECTIONS] Live count result:', connectionsCount);
      }

      // Compute a simple "performance score" out of 100
      // Performance = 50% question engagement, 50% connections engagement
      const attendeesCount = attendeesResult.count || 1; // prevent divide by zero
      const questionsCount = questionsResult.count || 0;

      // Up to 50 points for questions per attendee
      const questionsPerAttendee = questionsCount / attendeesCount;
      const questionsScore = Math.min((questionsPerAttendee / 3) * 50, 50); // 3+ questions/attendee = max score

      // Up to 50 points for connections per attendee
      const connectionsPerAttendee = connectionsCount / attendeesCount;
      const connectionsScore = Math.min((connectionsPerAttendee / 2) * 50, 50); // 2+ connections/attendee = max score

      const performanceScore = Math.round(questionsScore + connectionsScore);

      return {
        eventsCount: eventsCount || 0,
        attendeesCount: attendeesResult.count || 0,
        speakersCount: speakersResult.count || 0,
        questionsCount: questionsResult.count || 0,
        liveEventsCount: liveEvents.length,
        upcomingEventsCount: upcomingEvents.length,
        connectionsCount,
        performanceScore,
      };
    },
    enabled: !!currentUser?.id,
    refetchInterval: 30000,
  });

  return {
    dashboardData,
    isLoading,
    error,
  };
};

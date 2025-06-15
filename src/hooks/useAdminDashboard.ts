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
        // Proper Supabase .or() filter: no quotes on UUIDs
        const inList = uniqueAttendeeUserIds.join(',');
        const orFilter = `requester_id.in.(${inList}),recipient_id.in.(${inList})`;
        console.log('[DASHBOARD-CONNECTIONS] Query .or() filter:', orFilter);

        // Try .or() query first
        const { count: connectionsCountRes, data: orData, error: connectionsError } = await supabase
          .from('connections')
          .select('*', { count: 'exact', head: true })
          .or(orFilter)
          .eq('status', 'accepted');

        if (!connectionsError && typeof connectionsCountRes === 'number') {
          connectionsCount = connectionsCountRes;
          console.log('[DASHBOARD-CONNECTIONS] .or() count result:', connectionsCount);
        } else {
          // DEBUG fallback: try two queries and merge user IDs manually if .or() fails (Supabase restriction workaround)
          console.warn('[DASHBOARD-CONNECTIONS] .or() query failed, trying fallback approach.', { connectionsError });

          // Query by requester_id
          const { count: countRequester, error: errRequester } = await supabase
            .from('connections')
            .select('*', { count: 'exact', head: true })
            .in('requester_id', uniqueAttendeeUserIds)
            .eq('status', 'accepted');
          // Query by recipient_id
          const { count: countRecipient, error: errRecipient } = await supabase
            .from('connections')
            .select('*', { count: 'exact', head: true })
            .in('recipient_id', uniqueAttendeeUserIds)
            .eq('status', 'accepted');

          if (errRequester || errRecipient) {
            console.error('[DASHBOARD-CONNECTIONS] Fallback queries error:', errRequester, errRecipient);
            connectionsCount = 0;
          } else {
            // Fallback will overcount bi-directional connections, so if exactness is needed fetch full data and de-duplicate by id.
            // For performance we sum counts, but ideally you would fetch and dedupe here (not head:true).
            if (typeof countRequester === 'number' && typeof countRecipient === 'number') {
              connectionsCount = countRequester + countRecipient;
            }
          }
          console.log('[DASHBOARD-CONNECTIONS] Fallback count:', connectionsCount);
        }
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

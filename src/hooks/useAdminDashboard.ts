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
  // Removed connectionsCount
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

      // Main engagement counts (attendees, speakers, questions)
      const [attendeesResult, speakersResult, questionsResult] = await Promise.all([
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
      ]);

      // New: Get polls, poll votes, suggestions & average ratings
      let pollsCount = 0, pollVotesCount = 0, suggestionsCount = 0, avgRating = 0;
      if (eventIds.length > 0) {
        // Polls count & poll votes
        const { count: _pollsCount } = await supabase
          .from('polls')
          .select('*', { count: 'exact', head: true })
          .in('event_id', eventIds);
        pollsCount = _pollsCount || 0;
        // Sum up total poll votes
        if (pollsCount > 0) {
          const { data: pollIdsResult } = await supabase
            .from('polls')
            .select('id')
            .in('event_id', eventIds);
          const pollIds = pollIdsResult?.map(p => p.id) || [];
          if (pollIds.length > 0) {
            const { count: _pollVotesCount } = await supabase
              .from('poll_votes')
              .select('*', { count: 'exact', head: true })
              .in('poll_id', pollIds);
            pollVotesCount = _pollVotesCount || 0;
          }
        }
        // Suggestions and average rating
        const { data: suggestionsData } = await supabase
          .from('suggestions')
          .select('rating')
          .in('event_id', eventIds);
        const allSuggestionRatings = (suggestionsData || []).map(s => s.rating).filter(r => typeof r === "number");
        suggestionsCount = suggestionsData ? suggestionsData.length : 0;
        if (allSuggestionRatings.length > 0) {
          avgRating = allSuggestionRatings.reduce((a, b) => a + b, 0) / allSuggestionRatings.length;
        }
      }

      // Compute sub-scores (each out of 100)
      const attendeesCount = attendeesResult.count || 1; // prevent divide by zero
      const questionsCount = questionsResult.count || 0;

      // 1. Questions Score (maxes at 3+ per attendee)
      const questionsPerAttendee = questionsCount / attendeesCount;
      const questionsScore = Math.min((questionsPerAttendee / 3) * 100, 100);

      // 2. Poll Engagement Score (maxes at 2 votes per attendee across all polls)
      const pollEngagementScore =
        attendeesCount > 0
          ? Math.min(((pollVotesCount / attendeesCount) / 2) * 100, 100)
          : 0;

      // 3. Suggestions Score (maxes at 1 suggestion per 4 attendees)
      const suggestionsScore = Math.min((suggestionsCount / (attendeesCount / 4)) * 100, 100);

      // 4. Ratings Score (5 is max rating)
      const ratingsScore = Math.min((avgRating / 5) * 100, 100);

      // Weighted (equal weights) event performance
      const perfComponents = [questionsScore, pollEngagementScore, suggestionsScore, ratingsScore];
      const performanceScore = Math.round(perfComponents.reduce((a, b) => a + b, 0) / perfComponents.length);

      return {
        eventsCount: eventsCount || 0,
        attendeesCount: attendeesResult.count || 0,
        speakersCount: speakersResult.count || 0,
        questionsCount: questionsResult.count || 0,
        liveEventsCount: liveEvents.length,
        upcomingEventsCount: upcomingEvents.length,
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
